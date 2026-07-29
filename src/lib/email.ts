import type { Lead } from "./schema";

/**
 * Transactional email.
 *
 * Resend is optional at build and run time. With RESEND_API_KEY absent the app
 * still builds, still accepts submissions and logs a structured record to the
 * console — so local development and a preview deploy never silently lose a
 * lead, and a missing env var can never take the forms down in production.
 *
 * The Resend SDK is imported dynamically so it stays out of the bundle graph
 * entirely when unused.
 */

const SALES_INBOX = process.env.SALES_INBOX ?? "info@absourcebiologics.com";
const EXPORT_INBOX = process.env.EXPORT_INBOX ?? SALES_INBOX;
const FROM = process.env.LEAD_FROM ?? "ABsource Biologics <noreply@absourcebiologics.com>";

/** Export enquiries route to their own inbox (Section 10). */
function inboxFor(lead: Lead): string {
  return lead.leadType === "export" ? EXPORT_INBOX : SALES_INBOX;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Subject lines are written so the sales inbox can triage on the subject
 * alone. A TDS download names the document, because someone pulling the
 * ABCHEESE data sheet is a materially hotter lead than a general enquiry.
 */
function subjectFor(lead: Lead): string {
  switch (lead.leadType) {
    case "quote":
      return `Quote request${lead.sku ? ` — ${lead.sku}` : ""} — ${lead.company}`;
    case "export":
      return `Export enquiry — ${lead.country} — ${lead.company}`;
    case "download":
      return `Data sheet requested — ${lead.doc} — ${lead.email}`;
    case "selector":
      return `Culture Selector result — ${lead.matches[0] ?? "no match"} — ${lead.email}`;
    case "contact":
      return `Contact form — ${lead.company}`;
    case "careers":
      return `Application${lead.role ? ` — ${lead.role}` : ""} — ${lead.name}`;
  }
}

function summaryRows(lead: Lead): Array<[string, string]> {
  const rows: Array<[string, string]> = [["Lead type", lead.leadType]];
  for (const [key, value] of Object.entries(lead)) {
    if (key === "leadType" || key === "companyWebsite" || key === "startedAt") continue;
    if (value === undefined || value === "") continue;
    rows.push([
      key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      typeof value === "object" ? JSON.stringify(value, null, 2) : String(value),
    ]);
  }
  return rows;
}

function renderHtml(lead: Lead): string {
  const rows = summaryRows(lead)
    .map(
      ([k, v]) =>
        `<tr><th align="left" style="padding:8px 16px 8px 0;color:#4A5654;font-weight:400;vertical-align:top">${escapeHtml(
          k
        )}</th><td style="padding:8px 0;color:#0C1413"><pre style="margin:0;font-family:inherit;white-space:pre-wrap">${escapeHtml(
          v
        )}</pre></td></tr>`
    )
    .join("");
  return `<div style="font-family:system-ui,sans-serif;line-height:1.6"><h1 style="font-size:18px;color:#0B3B3C">${escapeHtml(
    subjectFor(lead)
  )}</h1><table style="border-collapse:collapse;font-size:14px">${rows}</table></div>`;
}

/** Autoresponder. Deliberately plain and specific about what happens next. */
function renderAutoresponse(lead: Lead): string {
  const isExport = lead.leadType === "export";
  const body = isExport
    ? "Thank you for your enquiry. Export quotations involve confirming certification, packaging and shipping terms for your market, so these take a little longer than a domestic quote. A member of our export team will be in touch."
    : "Thank you for getting in touch. A technologist will read what you have sent and reply — this is not an automated recommendation.";
  return `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#0C1413"><p>${body}</p><p style="color:#4A5654">ABsource Biologics Pvt. Ltd.<br>Kinetic Innovation Park, MIDC Chinchwad, Pune 411019</p></div>`;
}

export type DeliveryResult = { delivered: boolean; reason?: string };

export async function deliverLead(lead: Lead): Promise<DeliveryResult> {
  // Structured record regardless of transport, so a lead is never lost to a
  // missing API key. Replace with a CRM webhook at this seam.
  // CRM-WEBHOOK-SEAM: post `lead` here when a CRM is chosen.
  console.info(
    "[lead]",
    JSON.stringify({ at: new Date().toISOString(), ...lead, companyWebsite: undefined })
  );

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { delivered: false, reason: "RESEND_API_KEY not set — logged to console only" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: FROM,
      to: inboxFor(lead),
      replyTo: lead.email,
      subject: subjectFor(lead),
      html: renderHtml(lead),
    });

    await resend.emails.send({
      from: FROM,
      to: lead.email,
      subject: "We've got your enquiry — ABsource Biologics",
      html: renderAutoresponse(lead),
    });

    return { delivered: true };
  } catch (error) {
    // Never fail the user's submission because email failed — the lead is
    // already in the log above and can be recovered from there.
    console.error("[lead] delivery failed", error);
    return { delivered: false, reason: "delivery failed" };
  }
}
