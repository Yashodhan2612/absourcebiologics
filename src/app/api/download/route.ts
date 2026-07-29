import { NextResponse } from "next/server";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { downloadLeadSchema, MIN_SUBMIT_MS } from "@/lib/schema";
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

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function makeToken(docSlug: string): string {
  const nonce = randomUUID();
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${docSlug}.${expires}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

type TokenCheck =
  | { ok: true; docSlug: string }
  | { ok: false; reason: string };

function verifyToken(token: string): TokenCheck {
  const parts = token.split(".");
  if (parts.length !== 4) return { ok: false, reason: "Malformed link." };
  const [docSlug, expiresRaw, nonce, signature] = parts as [string, string, string, string];

  const payload = `${docSlug}.${expiresRaw}.${nonce}`;
  if (!safeEqual(signature, sign(payload))) {
    return { ok: false, reason: "That link isn't valid." };
  }

  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) {
    return { ok: false, reason: "That link has expired. Request the document again." };
  }

  if (spentTokens.has(nonce)) {
    return { ok: false, reason: "That link has already been used." };
  }
  spentTokens.add(nonce);

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

  // A TDS request is a materially hotter lead than a general enquiry, and the
  // notification names the document so sales can see that.
  await deliverLead(lead);

  const response = NextResponse.json({
    ok: true,
    url: `/api/download?token=${encodeURIComponent(makeToken(doc.slug))}`,
  });

  // Consent cookie: subsequent downloads in this session are ungated.
  response.cookies.set("ab_doc_access", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
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
