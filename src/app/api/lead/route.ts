import { NextResponse } from "next/server";
import { leadSchema, MIN_SUBMIT_MS } from "@/lib/schema";
import { deliverLead } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * Unified lead intake. All four conversion paths funnel through here on a
 * discriminated union (Section 10).
 *
 * Order of checks is deliberate: cheap rejections first, so a bot flood costs
 * a schema parse rather than a Redis round trip and an email send.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    // Field-level errors go back to the form so it can render them inline.
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, fieldErrors }, { status: 400 });
  }

  const lead = parsed.data;

  // Honeypot. A filled hidden field is a bot; respond 200 so it learns nothing.
  if (lead.companyWebsite) {
    return NextResponse.json({ ok: true });
  }

  // Timing check: a human cannot complete these forms in under two seconds.
  const elapsed = Date.now() - lead.startedAt;
  if (Number.isFinite(elapsed) && elapsed < MIN_SUBMIT_MS) {
    return NextResponse.json({ ok: true });
  }

  const { allowed } = await rateLimit(clientIp(request));
  if (!allowed) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "That's several enquiries from this connection in the last hour. Email info@absourcebiologics.com and we'll pick it up directly.",
      },
      { status: 429 }
    );
  }

  const result = await deliverLead(lead);

  // The submission succeeded from the buyer's point of view even if email
  // transport failed — the lead is recorded either way, and telling them to
  // resend would just produce duplicates.
  return NextResponse.json({ ok: true, delivered: result.delivered });
}
