import { NextResponse } from "next/server";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  downloadLeadSchema,
  MIN_SUBMIT_MS,
  emailDomain,
  isFreeEmailDomain,
} from "@/lib/schema";
import { SITE_URL } from "@/lib/seo";
import { deliverLead } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { downloadBySlug } from "@/content/downloads";

/**
 * Gated document delivery (Section 10).
 *
 * POST records the lead and returns a signed, short-lived, single-use token.
 * GET exchanges that token for the file.
 *
 * Documents live in private/docs/, OUTSIDE public/, so they are never
 * reachable by guessing a URL — the only way to the bytes is through a valid
 * token, which only exists after a lead is recorded.
 *
 * Path traversal: `file` comes from downloads.ts and is re-validated here
 * against the catalogue rather than trusted from the request, and the resolved
 * path is checked to be inside DOCS_DIR before anything is read. A crafted
 * token cannot address a file outside that directory.
 */

const DOCS_DIR = path.join(process.cwd(), "private", "docs");
const TOKEN_TTL_MS = 15 * 60 * 1000;
/**
 * Sales needs longer than a buyer, and may open the link more than once — to
 * check the file before forwarding it, and again if that fails.
 *
 * 72 hours, not a week: it is a bearer credential sitting in an inbox, and the
 * shorter it lives the smaller that window is. If a request is not actioned
 * inside three working days, re-issuing it is one click from the lead record.
 */
const RELEASE_TTL_MS = 72 * 60 * 60 * 1000;

/**
 * Signing secret. In production DOWNLOAD_SECRET must be set; without it the
 * process falls back to a per-boot random value, which still signs correctly
 * but invalidates tokens on restart. That is a deliberate fail-safe rather
 * than fail-open: no secret can be forged, worst case a buyer re-requests.
 */
const SECRET =
  process.env.DOWNLOAD_SECRET ??
  (() => {
    if (process.env.NODE_ENV === "production") {
      console.warn("[download] DOWNLOAD_SECRET not set — tokens reset on restart");
    }
    return randomUUID();
  })();

/**
 * Single-use enforcement. In-process, so it is per-instance rather than
 * global — a token could in principle be reused against a different serverless
 * instance inside its 15-minute window. Accepted deliberately: the alternative
 * is requiring Redis for downloads to work at all. Move this to Upstash if
 * document access ever needs to be strictly single-use.
 */
const spentTokens = new Set<string>();
/**
 * Bound the set. Nonces are only meaningful for TOKEN_TTL_MS, but nothing was
 * evicting them, so a long-lived instance accumulated one UUID per download
 * for as long as it ran. The cap is far above any plausible burst; oldest-first
 * eviction can in principle let a very old token be replayed, which is exactly
 * what its 15-minute expiry already refuses.
 */
const MAX_SPENT_TOKENS = 10_000;

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

type TokenPurpose = "buyer" | "release";

function makeToken(docSlug: string, purpose: TokenPurpose, ttlMs: number): string {
  const nonce = randomUUID();
  const expires = Date.now() + ttlMs;
  const payload = `${docSlug}.${purpose}.${expires}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

type TokenCheck =
  | { ok: true; docSlug: string }
  | { ok: false; reason: string };

function verifyToken(token: string): TokenCheck {
  const parts = token.split(".");
  if (parts.length !== 5) return { ok: false, reason: "Malformed link." };
  const [docSlug, purpose, expiresRaw, nonce, signature] = parts as [
    string,
    string,
    string,
    string,
    string,
  ];

  const payload = `${docSlug}.${purpose}.${expiresRaw}.${nonce}`;
  if (!safeEqual(signature, sign(payload))) {
    return { ok: false, reason: "That link isn't valid." };
  }

  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) {
    return { ok: false, reason: "That link has expired. Request the document again." };
  }

  // Fail closed on an unrecognised purpose rather than falling through to the
  // permissive branch. Not exploitable — purpose is inside the HMAC, so it
  // cannot be edited — but an unknown value should never be the one that skips
  // the single-use check.
  if (purpose !== "buyer" && purpose !== "release") {
    return { ok: false, reason: "That link isn't valid." };
  }

  // Single use applies to the buyer's link only. Sales must be able to open a
  // release link more than once — to check the file before forwarding it, and
  // again if the first attempt fails.
  if (purpose === "buyer") {
    if (spentTokens.has(nonce)) {
      return { ok: false, reason: "That link has already been used." };
    }
    if (spentTokens.size >= MAX_SPENT_TOKENS) {
      const oldest = spentTokens.values().next();
      if (!oldest.done) spentTokens.delete(oldest.value);
    }
    spentTokens.add(nonce);
  }

  return { ok: true, docSlug };
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = downloadLeadSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, fieldErrors }, { status: 400 });
  }

  const lead = parsed.data;
  if (lead.companyWebsite) return NextResponse.json({ ok: true });
  if (Date.now() - lead.startedAt < MIN_SUBMIT_MS) return NextResponse.json({ ok: true });

  const doc = downloadBySlug(lead.doc);
  if (!doc) {
    return NextResponse.json({ ok: false, error: "Unknown document." }, { status: 404 });
  }

  const { allowed } = await rateLimit(clientIp(request));
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Email info@absourcebiologics.com and we'll send it directly." },
      { status: 429 }
    );
  }

  // A data sheet request is a materially hotter lead than a general enquiry.
  // The notification carries everything needed to verify the dairy — role,
  // phone, city, mailbox type — plus a link that releases the file once a
  // person is satisfied.
  const delivery = await deliverLead(lead, {
    releaseUrl: `${SITE_URL}/api/download?token=${encodeURIComponent(
      makeToken(doc.slug, "release", RELEASE_TTL_MS)
    )}`,
    emailDomain: emailDomain(lead.email),
    freeMailbox: isFreeEmailDomain(lead.email),
  });

  // Documents default to on-approval: the client asked to authenticate the
  // dairy before a data sheet goes out, so nothing is streamed here. A
  // document explicitly marked `instant` still downloads in the same
  // interaction.
  //
  // The `ab_doc_access` cookie that used to be set here has been removed. It
  // was written on every request and read by nothing, so it ungated exactly
  // nothing while still being a 30-day cookie the privacy page had to account
  // for. Under approval-based release there is nothing for it to do.
  if (doc.release === "instant") {
    return NextResponse.json({
      ok: true,
      released: true,
      url: `/api/download?token=${encodeURIComponent(
        makeToken(doc.slug, "buyer", TOKEN_TTL_MS)
      )}`,
    });
  }

  // Under approval-based release, email is the ONLY route to the document —
  // there is no file coming back in this response. So a delivery failure has
  // to reach the requester rather than being swallowed the way it safely could
  // be when the download happened regardless. The lead is still recorded in
  // the server log either way; what changes is that we do not tell someone to
  // wait for an email that was never sent.
  return NextResponse.json({ ok: true, released: false, notified: delivery.delivered });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing link." }, { status: 400 });
  }

  const check = verifyToken(token);
  if (!check.ok) {
    return NextResponse.json({ ok: false, error: check.reason }, { status: 403 });
  }

  // Re-resolve from the catalogue rather than trusting anything in the token.
  const doc = downloadBySlug(check.docSlug);
  if (!doc || doc.file.includes("/") || doc.file.includes("\\")) {
    return NextResponse.json({ ok: false, error: "Unknown document." }, { status: 404 });
  }

  const filePath = path.resolve(DOCS_DIR, doc.file);
  if (!filePath.startsWith(DOCS_DIR + path.sep)) {
    return NextResponse.json({ ok: false, error: "Unknown document." }, { status: 404 });
  }

  try {
    const bytes = await readFile(filePath);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${doc.file}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    // The document is declared but the PDF has not been supplied yet. Say so
    // clearly rather than returning a 500 the buyer cannot interpret.
    return NextResponse.json(
      {
        ok: false,
        error:
          "That data sheet isn't published yet. We've recorded your request and will email it to you directly.",
      },
      { status: 404 }
    );
  }
}
