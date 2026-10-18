import type { Lead } from "./schema";
import { company, positioning } from "@/content/company";
import { fssai } from "@/content/certifications";
import { downloadBySlug, requesterRoleLabel } from "@/content/downloads";
import { CULTURES_OFFERED_LABEL, productBySlug, products } from "@/content/products";
import { productLineCount, spell } from "@/content/counts";
import { solutions } from "@/content/solutions";
import { stats } from "@/content/stats";
import { SITE_URL } from "./seo";

/**
 * The email a visitor receives after submitting a form.
 *
 * It used to be one plain sentence. It is now a branded, multi-section message
 * whose content depends on WHICH form was submitted (a job applicant and an
 * importer are told different things), built to look the same in Gmail,
 * Outlook, Apple Mail and Zoho.
 *
 * HOW IT SURVIVES EVERY MAIL CLIENT. Mail clients are not browsers, and the
 * one that matters most, desktop Outlook, renders with Microsoft Word. So:
 *  - Layout is nested tables with width attributes. No flexbox, grid, CSS
 *    variables, web fonts or margin on tables, none of which Outlook honours.
 *  - Every style is inline. A <style> block is used ONLY for the mobile
 *    adjustments and for the client resets; the message reads correctly if it
 *    is stripped, which Gmail does for some account types.
 *  - Colours are set twice, as a bgcolor attribute and as CSS, because Outlook
 *    reads the attribute.
 *  - The button is a padded table cell, not a styled link, so it keeps its
 *    shape in Outlook.
 *  - The logo is a PNG (Outlook has no WebP support) with a width attribute
 *    and styled alt text, so with images blocked the header still says
 *    "ABsource Biologics" in brand colours.
 *  - 600px wide, with a conditional table so Outlook honours it.
 *  - A plain-text alternative is always sent with it. It is what a text-only
 *    reader sees, and a message with no text part scores worse with spam
 *    filters.
 *  - It declares itself light-only, so Apple Mail does not recolour it.
 *
 * Pure: no I/O, no environment reads beyond the optional base-URL override, so
 * it is unit tested for every lead type (lead-email.test.ts).
 *
 * CLAIMS. Every figure here comes from the same content modules the website
 * reads (stats, company, certifications, counts), so the email cannot drift
 * from the site, and nothing is promised that the site does not say. In
 * particular there is NO response-time promise: the site makes none.
 */

/* ----------------------------------------------------------------- palette */

const INK = "#0C1413";
const INK_60 = "#4A5654";
const TANK = "#0B3B3C";
const TANK_300 = "#9FC4C4";
const CHILL = "#DCE7E7";
const MILK = "#FBFAF7";
const PAGE = "#EEF2F1";
const GHEE = "#E4A33B";
const GHEE_DARK = "#986615";

const FONT = "'Segoe UI',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif";

/* ------------------------------------------------------------------- bases */

/**
 * Where links and the logo point. The site's own address by default.
 *
 * EMAIL_BASE_URL exists for one situation: testing before the domain is
 * switched over. The logo and every link are absolute URLs on the live site,
 * so until absourcebiologics.com serves this site they would 404; setting
 * EMAIL_BASE_URL to the temporary address makes a test email render fully.
 * Leave it unset in production.
 */
function baseUrl(): string {
  const override = process.env.EMAIL_BASE_URL?.trim().replace(/\/+$/, "");
  return override || SITE_URL;
}

const LOGO_PATH = "/email/logo-reversed.png";

/* ----------------------------------------------------------------- content */

export type EmailContent = {
  readonly subject: string;
  /** The grey preview line shown beside the subject in an inbox. */
  readonly preheader: string;
  readonly eyebrow: string;
  readonly headline: string;
  readonly paragraphs: readonly string[];
  /** What they sent us, echoed back so the message reads as theirs. */
  readonly summary: readonly { label: string; value: string }[];
  readonly summaryTitle: string;
  readonly cta: { label: string; path: string };
  readonly readMore: readonly { title: string; blurb: string; path: string }[];
  /** The address replies are meant to reach, shown in the footer. */
  readonly contactEmail: string;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(full: string | undefined): string {
  const first = (full ?? "").trim().split(/\s+/)[0] ?? "";
  // Keep a lone initial or an all-caps shout from reading oddly.
  if (first.length < 2) return "";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function greeting(lead: Lead, line: (name: string) => string, fallback: string): string {
  const name = firstName("name" in lead ? lead.name : undefined);
  return name ? line(name) : fallback;
}

/** A long free-text message, trimmed so the echo stays a summary. */
function excerpt(text: string | undefined, max = 280): string | null {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  if (!flat) return null;
  return flat.length > max ? `${flat.slice(0, max).trimEnd()}…` : flat;
}

function rowsOf(pairs: ReadonlyArray<readonly [string, string | null | undefined]>) {
  return pairs
    .filter((p): p is readonly [string, string] => typeof p[1] === "string" && p[1].trim() !== "")
    .map(([label, value]) => ({ label, value: value.trim() }));
}

function pretty(slug: string): string {
  const spaced = slug.replace(/[-_]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const AUDIT_LABELS: Record<string, string> = {
  documentation: "Certification and audit documentation",
  "site-visit": "A site visit or audit date",
  questionnaire: "Our response to your vendor questionnaire",
  other: "Something else",
};

const EXPORT_ROLES: Record<string, string> = {
  distributor: "Distributor",
  importer: "Importer",
  "end-user": "End user",
};

/* ----- the shared "who we are" paragraph. Every figure is from the content
 * modules the website uses, so the two cannot disagree. */

function aboutParagraph(): string {
  return (
    `ABsource Biologics was founded in Pune in ${company.foundedYear} and has been in commercial production ` +
    `since ${company.firstCommercialYear}. We develop and manufacture ${CULTURES_OFFERED_LABEL} Direct Vat Set starter cultures ` +
    `across ${spell(productLineCount)} product lines, in our own clean-room facility with an in-process QC lab, ` +
    `and supply ${stats.customersServed.display} customers across India and export markets.`
  );
}

function certificationsParagraph(): string {
  return (
    `Our plant is ISO 9001:2015 and ISO 22000:2018 certified, with HACCP and HALAL certification, ` +
    `and holds a Central FSSAI licence (no. ${fssai.licenceNumber}).`
  );
}

const READ_MORE = {
  products: {
    title: "Our product lines",
    blurb: `${CULTURES_OFFERED_LABEL} cultures across ${spell(productLineCount)} lines, with dairy ingredients and taste makers.`,
    path: "/products",
  },
  selector: {
    title: "The Culture Selector",
    blurb: "Tell us what you make and it names the cultures to trial, with the reasoning shown.",
    path: "/culture-selector",
  },
  why: {
    title: "Why ABsource",
    blurb: "Five differences that hold up under procurement scrutiny.",
    path: "/why-absource",
  },
  quality: {
    title: "Quality and certifications",
    blurb: "Our certificates, FSSAI licence and what happens before a batch is released.",
    path: "/quality",
  },
  export: {
    title: "Exporting from India",
    blurb: "How we supply distributors and importers directly from Pune.",
    path: "/export",
  },
  about: {
    title: "About the company",
    blurb: "Why ABsource exists, and the people who built it.",
    path: "/about",
  },
  team: {
    title: "Meet the team",
    blurb: "The department heads behind every culture that leaves the plant.",
    path: "/team",
  },
  downloads: {
    title: "Data sheets",
    blurb: "Technical data sheets, released once we have confirmed who is asking.",
    path: "/downloads",
  },
} as const;

/**
 * What each kind of form is told. Two or more paragraphs for every one, and
 * the specifics differ: an importer hears about certification and shipping, a
 * candidate hears about the team, an auditor is sent to the certificates.
 */
export function contentFor(lead: Lead): EmailContent {
  switch (lead.leadType) {
    case "contact": {
      const message = excerpt(lead.message);
      return {
        subject: "Thank you for contacting ABsource Biologics",
        preheader: "Your message has reached our team in Pune. A technologist will read it and reply personally.",
        eyebrow: "Message received",
        headline: greeting(lead, (n) => `Thank you for getting in touch, ${n}.`, "Thank you for getting in touch."),
        paragraphs: [
          "Your message has reached the ABsource team in Pune. A technologist will read it in full and reply to you personally. This is not an automated recommendation.",
          "If your question is about a specific product or process, a reply to this email with your milk type, daily volume and the product you are making helps us give you a precise answer first time.",
          aboutParagraph(),
        ],
        summaryTitle: "What you sent us",
        summary: rowsOf([
          ["Company", lead.company],
          ["Message", message],
        ]),
        cta: { label: "Explore our product lines", path: READ_MORE.products.path },
        readMore: [READ_MORE.selector, READ_MORE.why, READ_MORE.quality],
        contactEmail: company.email,
      };
    }

    case "quote": {
      const product = lead.sku ? productBySlug("cultures", lead.sku) ?? products.find((p) => p.slug === lead.sku) : undefined;
      const application = solutions.find((s) => s.slug === lead.application)?.name;
      return {
        subject: "We have your quote request, ABsource Biologics",
        preheader: product
          ? `A technologist is reviewing your request for ${product.name}.`
          : "A technologist is reviewing your request and will come back with the right culture to trial.",
        eyebrow: "Quote request received",
        headline: greeting(lead, (n) => `We have your request, ${n}.`, "We have your request."),
        paragraphs: [
          `Thank you for asking ABsource for a quote${product ? ` on ${product.name}` : ""}. A technologist will review what you have shared and come back to you with the right product line and a proposal to trial it against your current process.`,
          "How a starter performs depends on your milk, your equipment and your process conditions, so we confirm the culture against those before anything is quoted. If you can reply with your milk type and fat level, the incubation set-up and the finish you are targeting, we can usually settle the right culture in a single exchange.",
          aboutParagraph(),
        ],
        summaryTitle: "Your request",
        summary: rowsOf([
          ["Product of interest", product?.name],
          ["Application", application],
          ["Volumes", lead.volume],
          ["Timeline", lead.timeline],
          ["Company", lead.company],
          ["City", lead.city],
          ["Notes", excerpt(lead.message)],
        ]),
        cta: { label: "Explore our product lines", path: READ_MORE.products.path },
        readMore: [READ_MORE.selector, READ_MORE.quality, READ_MORE.why],
        contactEmail: company.email,
      };
    }

    case "export": {
      return {
        subject: "Your export enquiry, ABsource Biologics",
        preheader: `Our export team is reviewing your enquiry for ${lead.country}.`,
        eyebrow: "Export enquiry received",
        headline: greeting(lead, (n) => `Thank you for your enquiry, ${n}.`, "Thank you for your enquiry."),
        paragraphs: [
          `Thank you for your export enquiry for ${lead.country}. Export quotations involve confirming certification, packaging and shipping terms for your market, so they take a little longer than a domestic quote. A member of our export team will review your enquiry and reply to you personally.`,
          `We supply distributors and importers directly from our facility in Pune, with no intermediary between you and the people who make the culture. ${certificationsParagraph()} If your market requires specific documents or registrations, reply to this email and tell us which.`,
          aboutParagraph(),
        ],
        summaryTitle: "Your enquiry",
        summary: rowsOf([
          ["Country", lead.country],
          ["How you would work with us", EXPORT_ROLES[lead.role] ?? lead.role],
          ["Products of interest", lead.productsOfInterest],
          ["Estimated annual volume", lead.annualVolume],
          ["Certifications required", lead.certifications],
          ["Incoterms", lead.incoterms],
          ["Company", lead.company],
          ["Notes", excerpt(lead.message)],
        ]),
        cta: { label: "Read about exporting from India", path: READ_MORE.export.path },
        readMore: [READ_MORE.quality, READ_MORE.products, READ_MORE.why],
        contactEmail: company.email,
      };
    }

    case "download": {
      const doc = downloadBySlug(lead.doc);
      return {
        subject: "Your data sheet request, ABsource Biologics",
        preheader: "We confirm who is asking before a data sheet is sent. A technologist is checking your details.",
        eyebrow: "Data sheet requested",
        headline: greeting(lead, (n) => `Thank you, ${n}. We have your request.`, "Thank you. We have your request."),
        paragraphs: [
          `Thank you for requesting ${doc ? `the ${doc.title}` : "a data sheet"}. Data sheets carry composition, dosage and incubation parameters, so we confirm who is asking before one is sent. A technologist will check your details and email the document across, and will call you on the number you gave if anything needs clarifying.`,
          "While you wait, our Culture Selector can narrow the range to the cultures worth trialling for what you make, and our Quality page sets out the certificates and checks behind every batch.",
          aboutParagraph(),
        ],
        summaryTitle: "Your request",
        summary: rowsOf([
          ["Document", doc?.title ?? lead.doc],
          ["Company", lead.company],
          ["Your role", requesterRoleLabel(lead.role)],
          ["Plant location", [lead.city, lead.country].filter(Boolean).join(", ")],
        ]),
        cta: { label: "Open the Culture Selector", path: READ_MORE.selector.path },
        readMore: [READ_MORE.quality, READ_MORE.downloads, READ_MORE.products],
        contactEmail: company.email,
      };
    }

    case "selector": {
      const answers = Object.entries(lead.answers)
        .filter(([, v]) => v && v !== "unsure")
        .map(([k, v]) => `${pretty(k)}: ${pretty(v)}`)
        .join("\n");
      return {
        subject: "Your culture recommendation, ABsource Biologics",
        preheader: lead.matches[0]
          ? `Your Culture Selector result: ${lead.matches[0]}.`
          : "Your Culture Selector result, with the answers it was based on.",
        eyebrow: "Your Culture Selector result",
        headline: greeting(lead, (n) => `Your recommendation, ${n}.`, "Your recommendation."),
        paragraphs: [
          "Thank you for using the ABsource Culture Selector. Your result is below with the answers it was based on, so you can forward it inside your team.",
          "A recommendation names the cultures worth trialling. Which one we supply depends on your milk and your process, so a technologist confirms it with you before any sample ships, and will be in touch about it.",
          aboutParagraph(),
        ],
        summaryTitle: "Your result",
        summary: rowsOf([
          ["Cultures to trial", lead.matches.join("\n")],
          ["Your answers", answers],
          ["Company", lead.company],
        ]),
        cta: { label: "Request a sample", path: "/request-a-quote" },
        readMore: [READ_MORE.products, READ_MORE.quality, READ_MORE.why],
        contactEmail: company.email,
      };
    }

    case "careers": {
      return {
        subject: "Your application to ABsource Biologics",
        preheader: "Your application has reached our HR team, and a person will read it.",
        eyebrow: "Application received",
        headline: greeting(lead, (n) => `Thank you for applying, ${n}.`, "Thank you for applying."),
        paragraphs: [
          "Thank you for your interest in ABsource Biologics. Your application has reached our HR team, and a person will read it. If your background fits something we are hiring for, we will be in touch. If you have a CV to share, simply reply to this email and attach it.",
          "Our work spans strain development, quality control and quality assurance, production and packaging, and the commercial and people functions that keep it running. You can meet the heads of those departments on our website, and read why the company exists.",
          aboutParagraph(),
        ],
        summaryTitle: "Your application",
        summary: rowsOf([
          ["Kind of work", lead.role],
          ["About you", excerpt(lead.message)],
        ]),
        cta: { label: "Meet the team", path: READ_MORE.team.path },
        readMore: [READ_MORE.about, READ_MORE.why, READ_MORE.quality],
        contactEmail: company.hrEmail,
      };
    }

    case "audit": {
      return {
        subject: "Your vendor audit request, ABsource Biologics",
        preheader: "Your request has gone to our quality assurance team.",
        eyebrow: "Request received",
        headline: greeting(lead, (n) => `Thank you, ${n}. We have your request.`, "Thank you. We have your request."),
        paragraphs: [
          "Your request has gone to our quality assurance team, who hold the certifications, audit documentation and site-visit scheduling. They will reply with what they can share, and with what needs a call.",
          `You can start your review now: our current certificates and FSSAI licence are published in full on our Quality page. ${certificationsParagraph()}`,
          aboutParagraph(),
        ],
        summaryTitle: "Your request",
        summary: rowsOf([
          ["What you need", lead.request ? AUDIT_LABELS[lead.request] ?? lead.request : null],
          ["Company", lead.company],
          ["Notes", excerpt(lead.message)],
        ]),
        cta: { label: "View our certifications", path: READ_MORE.quality.path },
        readMore: [READ_MORE.why, READ_MORE.products, READ_MORE.about],
        contactEmail: company.qaEmail,
      };
    }
  }
}

/* --------------------------------------------------------------- rendering */

function link(href: string, label: string, style: string): string {
  return `<a href="${esc(href)}" target="_blank" style="${style}">${esc(label)}</a>`;
}

/** The four figures, all from the content modules. */
function credentialCells(): Array<[string, string]> {
  return [
    [`${company.foundedYear}`, "Founded in Pune"],
    [CULTURES_OFFERED_LABEL, "DVS starter cultures"],
    [`${productLineCount}`, "Product lines"],
    [stats.customersServed.display, "Customers served"],
  ];
}

export function renderHtml(content: EmailContent): string {
  const base = baseUrl();
  const abs = (path: string) => `${base}${path}`;
  const P = `font-family:${FONT};font-size:16px;line-height:26px;color:${INK_60};margin:0`;

  const paragraphs = content.paragraphs
    .map((text, i) => `<tr><td class="ab-pad" style="padding:${i === 0 ? "0" : "16px"} 40px 0 40px;${P.replace("margin:0", "")}" bgcolor="#FFFFFF">${esc(text)}</td></tr>`)
    .join("");

  const summaryRows = content.summary
    .map(
      ({ label, value }) =>
        `<tr>
          <td valign="top" width="34%" style="padding:10px 12px 10px 0;border-top:1px solid ${CHILL};font-family:${FONT};font-size:12px;line-height:18px;letter-spacing:.06em;text-transform:uppercase;color:${INK_60}">${esc(label)}</td>
          <td valign="top" style="padding:10px 0;border-top:1px solid ${CHILL};font-family:${FONT};font-size:15px;line-height:22px;color:${INK}">${esc(value).replace(/\n/g, "<br>")}</td>
        </tr>`
    )
    .join("");

  const summary = content.summary.length
    ? `<tr><td class="ab-pad" style="padding:28px 40px 0 40px" bgcolor="#FFFFFF">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${MILK}" style="background:${MILK};border:1px solid ${CHILL}">
          <tr><td style="padding:18px 22px 6px 22px;font-family:${FONT};font-size:13px;line-height:18px;letter-spacing:.08em;text-transform:uppercase;color:${GHEE_DARK};font-weight:600">${esc(content.summaryTitle)}</td></tr>
          <tr><td style="padding:0 22px 12px 22px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${summaryRows}</table></td></tr>
        </table>
      </td></tr>`
    : "";

  const cta = `<tr><td class="ab-pad" style="padding:32px 40px 0 40px" bgcolor="#FFFFFF">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td bgcolor="${GHEE}" style="background:${GHEE};border-radius:3px;mso-padding-alt:14px 26px">
          <a href="${esc(abs(content.cta.path))}" target="_blank" style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:15px;line-height:20px;font-weight:600;color:${INK};text-decoration:none">${esc(content.cta.label)} &rarr;</a>
        </td></tr></table>
    </td></tr>`;

  const credentials = credentialCells()
    .map(
      ([figure, label]) =>
        `<td align="center" valign="top" width="25%" style="padding:6px 4px">
          <div style="font-family:${FONT};font-size:26px;line-height:30px;font-weight:600;color:${TANK};letter-spacing:-.5px">${esc(figure)}</div>
          <div style="font-family:${FONT};font-size:12px;line-height:16px;color:${INK_60};padding-top:2px">${esc(label)}</div>
        </td>`
    )
    .join("");

  const readMore = content.readMore
    .map(
      (item) =>
        `<tr><td style="padding:12px 0;border-top:1px solid ${CHILL}">
          ${link(abs(item.path), `${item.title} →`, `font-family:${FONT};font-size:16px;line-height:22px;font-weight:600;color:${TANK};text-decoration:none`)}
          <div style="font-family:${FONT};font-size:14px;line-height:21px;color:${INK_60};padding-top:2px">${esc(item.blurb)}</div>
        </td></tr>`
    )
    .join("");

  const footerLink = `font-family:${FONT};font-size:13px;line-height:20px;color:${TANK_300};text-decoration:underline`;
  const footerText = `font-family:${FONT};font-size:13px;line-height:20px;color:${TANK_300}`;
  const nav = [
    ["Products", "/products"],
    ["Solutions", "/solutions"],
    ["Quality", "/quality"],
    ["About", "/about"],
    ["Careers", "/careers"],
    ["Contact", "/contact"],
  ]
    .map(([label, path]) => link(abs(path!), label!, footerLink))
    .join(`<span style="${footerText}"> &nbsp;|&nbsp; </span>`);

  const phones = company.phones
    .map((p) => link(`tel:${p.replace(/\s+/g, "")}`, p, footerLink))
    .join(`<span style="${footerText}"> &nbsp;/&nbsp; </span>`);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(content.subject)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><style>td,th,div,p,a,h1,h2{font-family:'Segoe UI',Arial,sans-serif!important}</style><![endif]-->
<style>
body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
a{text-decoration:none}
@media screen and (max-width:620px){
  .ab-wrap{width:100%!important}
  .ab-pad{padding-left:22px!important;padding-right:22px!important}
  .ab-h1{font-size:26px!important;line-height:32px!important}
}
</style>
</head>
<body style="margin:0;padding:0;background:${PAGE};width:100%" bgcolor="${PAGE}">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${esc(content.preheader)}${"&nbsp;&zwnj;".repeat(30)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE}" style="background:${PAGE}">
<tr><td align="center" style="padding:24px 12px">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
<table role="presentation" class="ab-wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

  <tr><td class="ab-pad" bgcolor="${TANK}" style="background:${TANK};padding:26px 40px">
    <a href="${esc(abs("/"))}" target="_blank"><img src="${esc(abs(LOGO_PATH))}" width="190" height="62" alt="ABsource Biologics" style="display:block;border:0;width:190px;height:auto;font-family:${FONT};font-size:18px;line-height:62px;font-weight:600;color:#FBFAF7;white-space:nowrap"></a>
  </td></tr>
  <tr><td bgcolor="${GHEE}" height="4" style="background:${GHEE};height:4px;line-height:4px;font-size:4px">&nbsp;</td></tr>

  <tr><td class="ab-pad" bgcolor="#FFFFFF" style="padding:40px 40px 0 40px;background:#FFFFFF">
    <div style="font-family:${FONT};font-size:13px;line-height:18px;letter-spacing:.1em;text-transform:uppercase;color:${GHEE_DARK};font-weight:600">${esc(content.eyebrow)}</div>
    <h1 class="ab-h1" style="margin:12px 0 0 0;font-family:${FONT};font-size:30px;line-height:36px;font-weight:600;letter-spacing:-.6px;color:${INK}">${esc(content.headline)}</h1>
  </td></tr>
  <tr><td bgcolor="#FFFFFF" height="24" style="background:#FFFFFF;height:24px;line-height:24px;font-size:24px">&nbsp;</td></tr>

  ${paragraphs}
  ${summary}
  ${cta}

  <tr><td class="ab-pad" bgcolor="#FFFFFF" style="padding:40px 40px 0 40px;background:#FFFFFF">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F3F7F7" style="background:#F3F7F7;border:1px solid ${CHILL}"><tr><td style="padding:18px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${credentials}</tr></table></td></tr></table>
  </td></tr>

  <tr><td class="ab-pad" bgcolor="#FFFFFF" style="padding:36px 40px 0 40px;background:#FFFFFF">
    <div style="font-family:${FONT};font-size:13px;line-height:18px;letter-spacing:.08em;text-transform:uppercase;color:${GHEE_DARK};font-weight:600;padding-bottom:10px">Read more about us</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${readMore}<tr><td style="border-top:1px solid ${CHILL};font-size:1px;line-height:1px">&nbsp;</td></tr></table>
  </td></tr>
  <tr><td bgcolor="#FFFFFF" height="36" style="background:#FFFFFF;height:36px;line-height:36px;font-size:36px">&nbsp;</td></tr>

  <tr><td class="ab-pad" bgcolor="${TANK}" style="background:${TANK};padding:32px 40px 28px 40px">
    <div style="font-family:${FONT};font-size:16px;line-height:22px;font-weight:600;color:#FBFAF7">${esc(company.shortName)}</div>
    <div style="${footerText};padding-top:4px">${esc(positioning.claim)}</div>
    <div style="${footerText};padding-top:16px">${esc(company.legalName)}<br>${esc(company.address.line1)}, ${esc(company.address.line2)}<br>${esc(company.address.city)} ${esc(company.address.postcode)}, ${esc(company.address.country)}</div>
    <div style="${footerText};padding-top:12px">${phones}<br>${link(`mailto:${content.contactEmail}`, content.contactEmail, footerLink)}<br>${link(abs("/"), "absourcebiologics.com", footerLink)}</div>
    <div style="${footerText};padding-top:18px;border-top:1px solid #1D5557;margin-top:18px">${nav}</div>
    <div style="font-family:${FONT};font-size:12px;line-height:18px;color:#7FA9A9;padding-top:16px">ISO 9001:2015 &middot; ISO 22000:2018 &middot; HACCP &middot; HALAL &middot; FSSAI Central Licence ${esc(fssai.licenceNumber)}</div>
    <div style="font-family:${FONT};font-size:12px;line-height:18px;color:#7FA9A9;padding-top:12px">You are receiving this one-time confirmation because you submitted a form on absourcebiologics.com. Replying to this email reaches our team directly. ${link(abs("/legal/privacy"), "Privacy", `font-family:${FONT};font-size:12px;color:#7FA9A9;text-decoration:underline`)} &nbsp;&middot;&nbsp; ${link(abs("/legal/terms"), "Terms", `font-family:${FONT};font-size:12px;color:#7FA9A9;text-decoration:underline`)}</div>
  </td></tr>

</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

/** The plain-text part: same content, no markup, links written out. */
export function renderText(content: EmailContent): string {
  const base = baseUrl();
  const abs = (path: string) => `${base}${path}`;
  const out: string[] = [];
  out.push("ABSOURCE BIOLOGICS", "");
  out.push(content.eyebrow.toUpperCase(), content.headline, "");
  for (const p of content.paragraphs) out.push(p, "");
  if (content.summary.length) {
    out.push(content.summaryTitle.toUpperCase());
    for (const { label, value } of content.summary) out.push(`${label}: ${value.replace(/\n/g, "; ")}`);
    out.push("");
  }
  out.push(`${content.cta.label}: ${abs(content.cta.path)}`, "");
  out.push("READ MORE ABOUT US");
  for (const item of content.readMore) out.push(`- ${item.title}: ${abs(item.path)}`);
  out.push("");
  out.push("--");
  out.push(company.legalName);
  out.push(`${company.address.line1}, ${company.address.line2}, ${company.address.city} ${company.address.postcode}, ${company.address.country}`);
  out.push(`Phone: ${company.phones.join(" / ")}`);
  out.push(`Email: ${content.contactEmail}`);
  out.push(`Web: ${abs("/")}`);
  out.push(`ISO 9001:2015, ISO 22000:2018, HACCP, HALAL. FSSAI Central Licence ${fssai.licenceNumber}.`);
  out.push("");
  out.push("You are receiving this one-time confirmation because you submitted a form on absourcebiologics.com. Replying to this email reaches our team directly.");
  return out.join("\n");
}

/** What deliverLead sends to the visitor. */
export function buildAutoresponse(lead: Lead): { subject: string; html: string; text: string } {
  const content = contentFor(lead);
  return { subject: content.subject, html: renderHtml(content), text: renderText(content) };
}
