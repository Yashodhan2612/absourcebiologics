import type { Lead, LeadType } from "./schema";
import { downloadBySlug, requesterRoleLabel } from "@/content/downloads";

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
const HR_INBOX = process.env.HR_INBOX ?? "hr@absourcebiologics.com";
const QA_INBOX = process.env.QA_INBOX ?? "qa@absourcebiologics.com";
const FROM = process.env.LEAD_FROM ?? "ABsource Biologics <noreply@absourcebiologics.com>";

/**
 * Where each kind of enquiry lands.
 *
 * A total Record rather than a chain of ternaries, so adding a lead type is a
 * TYPE ERROR until it is routed. The previous shape defaulted everything that
 * was not an export to sales, which silently sent job applications to the
 * sales inbox the moment the careers form was added.
 *
 * Every address is overridable by environment variable, because these are the
 * client's real inboxes and a preview deploy must be able to point elsewhere.
 */
const INBOXES: Record<LeadType, string> = {
  quote: SALES_INBOX,
  export: EXPORT_INBOX,
  download: SALES_INBOX,
  selector: SALES_INBOX,
  contact: SALES_INBOX,
  careers: HR_INBOX,
  audit: QA_INBOX,
};

/**
 * Exported so it can be unit tested. Routing a lead to the wrong inbox is a
 * silent failure — the submission succeeds, the requester is thanked, and
 * nobody who can act on it ever sees it — so it is worth a test rather than a
 * manual check.
 */
export function inboxFor(lead: Pick<Lead, "leadType">): string {
  return INBOXES[lead.leadType];
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
    case "download": {
      // Named document and named company, so the inbox can triage on the
      // subject alone. It used to read "abdahi-tds — someone@gmail.com",
      // which identifies neither.
      const doc = downloadBySlug(lead.doc);
      return `Data sheet requested — ${doc?.title ?? lead.doc} — ${lead.company}`;
    }
    case "selector":
      return `Culture Selector result — ${lead.matches[0] ?? "no match"} — ${lead.email}`;
    case "contact":
      return `Contact form — ${lead.company}`;
    case "careers":
      return `New application via careers page${lead.role ? ` — ${lead.role}` : ""} — ${lead.name}`;
    case "audit":
      return `Vendor audit request — ${lead.company}`;
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

/**
 * The one-line "what just happened", above the field dump.
 *
 * Whoever opens this is not necessarily the person who commissioned the form.
 * HR receiving a careers application should not have to infer from a table of
 * fields which page it came from or what is expected of them.
 */
function introFor(lead: Lead): string {
  switch (lead.leadType) {
    case "careers":
      return "You have a new form response via the careers page. A candidate has applied; their CV follows by email to this inbox if they send one.";
    case "audit":
      return "You have a new form response via the vendor audit request form. A customer's quality function is asking for audit documentation or a site visit.";
    case "export":
      return "You have a new export enquiry. Confirm certification, packaging and shipping terms for their market before quoting.";
    case "download":
      return "You have a new data sheet request. Verify the dairy using the details below, then use the release link to send the document.";
    case "quote":
      return "You have a new quote request from the website.";
    case "selector":
      return "Someone completed the Culture Selector and asked for their result. Their answers are below.";
    case "contact":
      return "You have a new form response via the contact page.";
  }
}

/**
 * The notification.
 *
 * Table-based and inline-styled, because that is what survives Outlook. The
 * intro is what the reader acts on; the table is the record.
 */
function renderHtml(lead: Lead, context?: DownloadContext): string {
  const verification = context ? renderVerificationBlock(lead, context) : "";
  const rows = summaryRows(lead)
    .map(
      ([k, v]) =>
        `<tr><th align="left" style="padding:10px 20px 10px 0;color:#4A5654;font-weight:400;vertical-align:top;border-bottom:1px solid #E6E9E8;white-space:nowrap">${escapeHtml(
          k
        )}</th><td style="padding:10px 0;color:#0C1413;border-bottom:1px solid #E6E9E8"><pre style="margin:0;font-family:inherit;white-space:pre-wrap">${escapeHtml(
          v
        )}</pre></td></tr>`
    )
    .join("");

  return [
    `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.6;color:#0C1413;max-width:640px">`,
    `<div style="background:#0B3B3C;color:#FBF9F4;padding:20px 24px">`,
    `<p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9FB8B8">ABsource Biologics &middot; website</p>`,
    `<h1 style="margin:6px 0 0;font-size:19px;font-weight:600;color:#FBF9F4">${escapeHtml(
      subjectFor(lead)
    )}</h1>`,
    `</div>`,
    `<div style="padding:24px">`,
    `<p style="margin:0 0 20px;font-size:15px;color:#4A5654">${escapeHtml(introFor(lead))}</p>`,
    verification,
    `<table style="border-collapse:collapse;font-size:14px;width:100%">${rows}</table>`,
    `<p style="margin:24px 0 0;font-size:13px;color:#4A5654">Reply directly to this email to reach them &mdash; the reply-to is set to the address they gave.</p>`,
    `</div></div>`,
  ].join("");
}

/** Autoresponder. Deliberately plain and specific about what happens next. */
function renderAutoresponse(lead: Lead): string {
  const body =
    lead.leadType === "export"
      ? "Thank you for your enquiry. Export quotations involve confirming certification, packaging and shipping terms for your market, so these take a little longer than a domestic quote. A member of our export team will be in touch."
      : lead.leadType === "download"
        ? // Says WHY there is a wait. The generic line implied the file was on
          // its way with no verification step and no reason for the delay.
          "Thank you for requesting the data sheet. Data sheets carry composition, dosage and incubation parameters, so we confirm who is asking before we send one. A technologist will check your details and email it across, and will call you if anything needs clarifying."
        : lead.leadType === "careers"
          ? "Thank you for your interest in ABsource Biologics. Your application has reached our HR team and a person will read it. If your background fits something we are hiring for, we will be in touch."
          : lead.leadType === "audit"
            ? "Thank you for your request. It has gone to our quality assurance team, who hold the certifications, audit documentation and site-visit scheduling. They will reply with what they can share and what needs a call."
            : "Thank you for getting in touch. A technologist will read what you have sent and reply — this is not an automated recommendation.";
  return `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#0C1413"><p>${body}</p><p style="color:#4A5654">ABsource Biologics Pvt. Ltd.<br>Kinetic Innovation Park, MIDC Chinchwad, Pune 411019</p></div>`;
}

/**
 * Extra context the download route computes and the notification needs.
 *
 * Kept out of `Lead` on purpose: none of it is typed by the user, so it must
 * not be part of the validated payload.
 */
export type DownloadContext = {
  readonly releaseUrl: string;
  readonly emailDomain: string;
  readonly freeMailbox: boolean;
};

/**
 * The block that makes verification possible.
 *
 * The client asked to authenticate the dairy before releasing a data sheet, so
 * everything a person needs to make that call goes at the TOP of the
 * notification, above the generic field dump: who, at which company, in what
 * role, on what number, in which city, and whether the mailbox is a company
 * domain or a free one. Then a link that releases the file.
 *
 * Deliberately NOT included: the requester's IP address. legal.ts states the
 * site collects "only what you type into a form"; putting the IP in the
 * notification would make the privacy page false. If the client wants it, the
 * privacy page changes first.
 */
function renderVerificationBlock(lead: Lead, context: DownloadContext): string {
  if (lead.leadType !== "download") return "";
  const doc = downloadBySlug(lead.doc);

  const mailbox = context.freeMailbox
    ? `<span style="color:#C0442E">Free mailbox — confirm the dairy before releasing</span>`
    : "Company domain";

  const rows: Array<[string, string]> = [
    ["Document", doc ? `${doc.title} (${doc.kind})` : lead.doc],
    ["Company", lead.company],
    ["Contact", lead.name],
    ["Role", requesterRoleLabel(lead.role)],
    ["Work email", lead.email],
    ["Email domain", context.emailDomain],
    ["Phone", lead.phone],
    ["City", lead.city],
    ["Country", lead.country],
  ];

  const body = rows
    .map(
      ([k, v]) =>
        `<tr><th align="left" style="padding:6px 16px 6px 0;color:#4A5654;font-weight:400;vertical-align:top">${escapeHtml(
          k
        )}</th><td style="padding:6px 0;color:#0C1413">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  return `<div style="border:1px solid #DCE7E7;padding:16px;margin:0 0 24px">
    <h2 style="font-size:15px;margin:0 0 12px;color:#0B3B3C">Verify before releasing</h2>
    <table style="border-collapse:collapse;font-size:14px">${body}
      <tr><th align="left" style="padding:6px 16px 6px 0;color:#4A5654;font-weight:400">Mailbox</th><td style="padding:6px 0;color:#0C1413">${mailbox}</td></tr>
    </table>
    <p style="margin:16px 0 0"><a href="${escapeHtml(
      context.releaseUrl
    )}" style="color:#0B3B3C">Release this data sheet</a></p>
  </div>`;
}

export type DeliveryResult = { delivered: boolean; reason?: string };

export async function deliverLead(
  lead: Lead,
  context?: DownloadContext
): Promise<DeliveryResult> {
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
      html: renderHtml(lead, context),
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
