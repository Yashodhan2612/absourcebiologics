import type { Lead, LeadType } from "./schema";
import { downloadBySlug, requesterRoleLabel } from "@/content/downloads";

/**
 * Transactional email, over plain SMTP.
 *
 * NO EMAIL API SERVICE. This talks SMTP directly, so it relays through any
 * mailbox that will accept authenticated submission — a spare Gmail account, a
 * Zoho or Outlook mailbox, or the hosting provider's own SMTP. Nothing has to
 * be bought and no account beyond the mailbox itself has to be created.
 *
 * One thing worth being straight about: code cannot put a message in someone's
 * inbox on its own. Something has to relay it, and delivering straight to the
 * recipient's mail server from an application is not an option — cloud hosts
 * block outbound port 25, and mail arriving from a datacentre IP with no SPF,
 * DKIM or reverse DNS is rejected or spam-filed on sight. Authenticating to a
 * mailbox that already has a delivery reputation is what makes this arrive.
 *
 * SENDER vs RECIPIENT. The sender does not have to be an ABsource address, and
 * with Gmail it cannot be — Gmail rewrites From to the authenticated account.
 * That is fine: the notification only has to REACH info@ / hr@ / qa@, and it
 * arrives as an ordinary authenticated Gmail message, which is considerably
 * more deliverable than an unverified noreply@absourcebiologics.com would be.
 * `replyTo` is set to the person who filled the form, so replying still works.
 *
 * With SMTP_HOST absent the app still builds, still accepts submissions and
 * logs a structured record to the console — a missing env var can never take
 * the forms down.
 *
 * nodemailer is imported dynamically so it stays out of the bundle graph when
 * unused, and it keeps this route on the Node runtime rather than Edge, which
 * has no TCP sockets.
 */

const SALES_INBOX = process.env.SALES_INBOX ?? "info@absourcebiologics.com";
const EXPORT_INBOX = process.env.EXPORT_INBOX ?? SALES_INBOX;
const HR_INBOX = process.env.HR_INBOX ?? "hr@absourcebiologics.com";
const QA_INBOX = process.env.QA_INBOX ?? "qa@absourcebiologics.com";
/**
 * SMTP connection. Every field is an environment variable; nothing is
 * hardcoded, so the same build points at a throwaway mailbox in preview and
 * the real one in production.
 *
 * Port 465 is implicit TLS, 587 is STARTTLS. Defaulting to 465 because that is
 * what Gmail wants and it fails closed rather than starting in the clear.
 */
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 465);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

/**
 * The From address.
 *
 * Defaults to the authenticated SMTP user, because most providers — Gmail
 * certainly — refuse to send as anything else, and a From the provider
 * rewrites is worse than one chosen honestly. Override with LEAD_FROM only
 * when the mailbox is allowed to send as that address.
 */
const FROM = process.env.LEAD_FROM ?? SMTP_USER ?? "noreply@absourcebiologics.com";

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

/**
 * The SMTP transport, created once per warm instance.
 *
 * Serverless reuses a container across invocations, so caching the transporter
 * lets nodemailer keep the connection pool alive and skips a TLS handshake on
 * every submission. `pool: true` is what makes that reuse actually happen; a
 * cold start pays for one connection and subsequent leads ride on it.
 *
 * Typed as an inline structural type rather than importing nodemailer's own,
 * because a top-level type import would pull the package into the bundle
 * graph and defeat the dynamic import below.
 */
type MailTransport = {
  sendMail(options: {
    from: string;
    to: string;
    replyTo?: string;
    subject: string;
    html: string;
  }): Promise<unknown>;
  verify(): Promise<true>;
};

let transportPromise: Promise<MailTransport> | null = null;

function getTransport(): Promise<MailTransport> {
  transportPromise ??= (async () => {
    const nodemailer = await import("nodemailer");
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      // 465 is implicit TLS; 587 upgrades with STARTTLS. Getting this wrong is
      // the single most common cause of a hang on submit.
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      pool: true,
      maxConnections: 2,
      // Fail fast. A lead form that hangs for the platform's full function
      // timeout is worse than one that reports a failure the caller can act
      // on — and the lead is already in the log either way.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    }) as unknown as MailTransport;
  })();
  return transportPromise;
}

/**
 * Prove the credentials work without sending anything.
 *
 * Used by scripts/verify-email.mjs and worth calling after any change to the
 * mail environment — an SMTP misconfiguration is otherwise invisible until a
 * real lead is lost.
 */
export async function verifyTransport(): Promise<DeliveryResultVerify> {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return { ok: false, reason: "SMTP_HOST/SMTP_USER/SMTP_PASS not set" };
  }
  try {
    await (await getTransport()).verify();
    return { ok: true, host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, from: FROM };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "verify failed" };
  }
}

export type DeliveryResultVerify =
  | { ok: true; host: string; port: number; user: string; from: string }
  | { ok: false; reason: string };

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

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return {
      delivered: false,
      reason: "SMTP_HOST/SMTP_USER/SMTP_PASS not set — logged to console only",
    };
  }

  try {
    const transport = await getTransport();

    // The team notification is the one that matters, so it is sent and awaited
    // first and on its own. If the autoresponse to the requester then fails —
    // a typo'd address is the usual cause — the lead has still been delivered
    // and the team still knows. Sending both together would let a bad
    // recipient address on the customer's side hide a perfectly good lead.
    await transport.sendMail({
      from: FROM,
      to: inboxFor(lead),
      replyTo: lead.email,
      subject: subjectFor(lead),
      html: renderHtml(lead, context),
    });

    try {
      await transport.sendMail({
        from: FROM,
        to: lead.email,
        subject: "We've got your enquiry — ABsource Biologics",
        html: renderAutoresponse(lead),
      });
    } catch (error) {
      console.warn("[lead] autoresponse failed; notification was delivered", error);
    }

    return { delivered: true };
  } catch (error) {
    // Never fail the user's submission because email failed — the lead is
    // already in the log above and can be recovered from there.
    console.error("[lead] delivery failed", error);
    return {
      delivered: false,
      reason: error instanceof Error ? error.message : "delivery failed",
    };
  }
}
