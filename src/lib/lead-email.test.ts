import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildAutoresponse, contentFor } from "./lead-email";
import type { Lead } from "./schema";
import { company } from "@/content/company";
import { CULTURES_OFFERED_LABEL } from "@/content/products";

/**
 * The confirmation a visitor receives.
 *
 * Mail clients cannot be run in a test, so this pins the properties that make
 * a message survive them (table layout, inline styles, PNG logo, plain-text
 * part, absolute links) and the content rules the client set (a different,
 * multi-paragraph message per form, with the brand, links and footer).
 *
 * Set EMAIL_PREVIEW_DIR to also write every rendered message to disk, which is
 * how the templates are looked at in a browser.
 */

const T = 1_000;
const LEADS: Record<string, Lead> = {
  contact: { leadType: "contact", name: "Priya Nair", email: "priya@dairyplant.co.in", company: "Nair Dairy", message: "We run a 20,000 L/day curd plant and want to move off imported cultures.", startedAt: T },
  quote: { leadType: "quote", name: "Rahul Mehta", email: "rahul@dairyplant.co.in", company: "Mehta Milk", sku: "abdahi", application: "curd-dahi", volume: "5,000 L per day", timeline: "Within a month", city: "Nashik", startedAt: T },
  export: { leadType: "export", name: "Omar Al Farsi", email: "omar@importer.ae", company: "Gulf Dairy Trading", country: "United Arab Emirates", role: "importer", productsOfInterest: "ABYOGURT, ABCHEESE", annualVolume: "2 tonnes", certifications: "Halal", incoterms: "CIF Jebel Ali", startedAt: T },
  download: { leadType: "download", name: "Sunita Rao", email: "sunita@dairyplant.co.in", company: "Rao Dairy", phone: "+91 90000 00000", role: "qa", city: "Pune", country: "India", doc: "abdahi-tds", startedAt: T },
  selector: { leadType: "selector", email: "x@dairyplant.co.in", answers: { making: "cheese", style: "mozzarella" }, matches: ["AB516 (ABCHEESE)", "AB512 (ABCHEESE)"], startedAt: T },
  careers: { leadType: "careers", name: "Aman Verma", email: "aman@gmail.com", role: "Quality control", message: "M.Sc. microbiology, three years in a dairy QC lab.", startedAt: T },
  audit: { leadType: "audit", name: "Kavita Shah", email: "kavita@dairyplant.co.in", company: "Shah Foods", request: "documentation", startedAt: T },
};
const TYPES = Object.keys(LEADS);
const built = Object.fromEntries(TYPES.map((t) => [t, buildAutoresponse(LEADS[t]!)]));

afterEach(() => {
  delete process.env.EMAIL_BASE_URL;
});

describe("every form gets its own message", () => {
  it("covers every lead type", () => {
    expect(TYPES.sort()).toEqual(["audit", "careers", "contact", "download", "export", "quote", "selector"]);
  });

  it("uses a different subject for each, none of them the old generic line", () => {
    const subjects = TYPES.map((t) => built[t]!.subject);
    expect(new Set(subjects).size).toBe(TYPES.length);
    for (const s of subjects) expect(s).not.toMatch(/got your enquiry/i);
  });

  it("has at least two paragraphs of substance in every message", () => {
    for (const t of TYPES) {
      const c = contentFor(LEADS[t]!);
      expect(c.paragraphs.length, t).toBeGreaterThanOrEqual(2);
      expect(c.paragraphs.slice(0, 2).every((p) => p.length > 120), t).toBe(true);
    }
  });

  it("says something different to a job applicant, an importer and an auditor", () => {
    const text = (t: string) => built[t]!.text;
    expect(text("careers")).toMatch(/HR team/);
    expect(text("careers")).not.toMatch(/quotation|certificate/i);
    expect(text("export")).toMatch(/United Arab Emirates/);
    expect(text("export")).toMatch(/shipping terms/);
    expect(text("audit")).toMatch(/quality assurance/);
    expect(text("download")).toMatch(/data sheet/i);
    expect(text("selector")).toMatch(/AB516/);
  });

  it("greets the visitor by first name, and copes with having none", () => {
    expect(contentFor(LEADS.contact!).headline).toContain("Priya");
    expect(contentFor(LEADS.selector!).headline).toBe("Your recommendation.");
  });

  it("echoes what they sent, so the message reads as theirs", () => {
    expect(built.quote!.html).toContain("5,000 L per day");
    expect(built.quote!.html).toContain("ABDAHI");
    expect(built.export!.html).toContain("CIF Jebel Ali");
    expect(built.download!.html).toContain("ABDAHI");
    expect(built.audit!.html).toContain("Certification and audit documentation");
  });

  it("sends replies to the team that owns the enquiry", () => {
    expect(contentFor(LEADS.careers!).contactEmail).toBe(company.hrEmail);
    expect(contentFor(LEADS.audit!).contactEmail).toBe(company.qaEmail);
    expect(contentFor(LEADS.quote!).contactEmail).toBe(company.email);
  });
});

describe("it carries the brand, the links and the footer", () => {
  it.each(TYPES)("%s: logo, credentials, links, footer", (t) => {
    const { html } = built[t]!;
    expect(html).toContain('src="https://absourcebiologics.com/email/logo-reversed.png"');
    expect(html).toMatch(/alt="ABsource Biologics"/);
    expect(html).toContain(CULTURES_OFFERED_LABEL);
    expect(html).toContain("Founded in Pune");
    expect(html).toContain("Read more about us");
    expect(html).toContain("ISO 9001:2015");
    expect(html).toContain(company.address.line1);
    expect(html).toContain(`mailto:${contentFor(LEADS[t]!).contactEmail}`);
    expect(html).toMatch(/href="tel:\+91\d+"/);
    for (const page of ["/products", "/quality", "/about", "/careers", "/contact", "/legal/privacy", "/legal/terms"]) {
      expect(html, page).toContain(`href="https://absourcebiologics.com${page}"`);
    }
  });

  it("links only to https, mailto and tel, and every link is absolute", () => {
    for (const t of TYPES) {
      for (const [, href] of built[t]!.html.matchAll(/href="([^"]*)"/g)) {
        expect(href, `${t}: ${href}`).toMatch(/^(https:\/\/absourcebiologics\.com|mailto:|tel:)/);
      }
    }
  });

  it("can be pointed at another address for testing before the domain moves", () => {
    process.env.EMAIL_BASE_URL = "https://absourcebiologics.vercel.app/";
    const { html, text } = buildAutoresponse(LEADS.contact!);
    expect(html).toContain('src="https://absourcebiologics.vercel.app/email/logo-reversed.png"');
    expect(html).toContain('href="https://absourcebiologics.vercel.app/products"');
    expect(html).not.toContain("https://absourcebiologics.com/products");
    expect(text).toContain("https://absourcebiologics.vercel.app/products");
  });
});

describe("it is built for every mail client", () => {
  it.each(TYPES)("%s: uses only what Outlook, Gmail, Apple Mail and Zoho all render", (t) => {
    const { html } = built[t]!;
    // Layout: tables, with width attributes and a fixed-width Outlook wrapper.
    expect(html).toContain('role="presentation"');
    expect(html).toContain("<!--[if mso]>");
    expect(html).toContain('bgcolor="#0B3B3C"'); // colour as an attribute, for Outlook
    // Nothing a mail client drops or misrenders.
    for (const banned of [/display:\s*flex/i, /display:\s*grid/i, /var\(--/, /@import/i, /@font-face/i, /<link[^>]+stylesheet/i, /<script/i, /position:\s*(absolute|fixed)/i, /background-image/i, /\.webp|\.avif|\.svg/i]) {
      expect(html, `${t}: ${banned}`).not.toMatch(banned);
    }
    expect(html).toContain('name="color-scheme" content="light"');
    // The logo has dimensions and styled alt text, for images-off.
    expect(html).toMatch(/<img[^>]+width="190"[^>]+alt="ABsource Biologics"/);
    // Gmail clips a message over about 102KB.
    expect(Buffer.byteLength(html)).toBeLessThan(60_000);
  });

  it("always ships a plain-text part with the links written out", () => {
    for (const t of TYPES) {
      const { text } = built[t]!;
      expect(text.length, t).toBeGreaterThan(500);
      expect(text).not.toMatch(/<[a-z][^>]*>/i);
      expect(text).toContain("https://absourcebiologics.com/");
      expect(text).toContain("FSSAI");
    }
  });

  it("has a preview line for the inbox list, hidden in the body", () => {
    for (const t of TYPES) {
      const c = contentFor(LEADS[t]!);
      expect(c.preheader.length).toBeGreaterThan(30);
      expect(built[t]!.html).toContain(`display:none;font-size:1px`);
    }
  });
});

describe("what the visitor typed can never break or hijack the message", () => {
  it("escapes markup in every free-text field", () => {
    const hostile: Lead = {
      leadType: "contact",
      name: '<img src=x onerror=alert(1)> Eve',
      email: "eve@dairyplant.co.in",
      company: '"><script>alert(1)</script>',
      message: "<b>bold</b> & <a href='https://evil.example'>click</a>",
      startedAt: T,
    };
    const { html } = buildAutoresponse(hostile);
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toContain("<img src=x");
    expect(html).not.toContain("<b>bold</b>");
    expect(html).not.toContain("evil.example'>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("trims a very long message to an excerpt", () => {
    const long: Lead = { ...(LEADS.contact as Extract<Lead, { leadType: "contact" }>), message: "word ".repeat(2_000) };
    expect(Buffer.byteLength(buildAutoresponse(long).html)).toBeLessThan(60_000);
  });
});

describe("preview", () => {
  it("writes every message to disk when EMAIL_PREVIEW_DIR is set", () => {
    const dir = process.env.EMAIL_PREVIEW_DIR;
    if (!dir) return;
    mkdirSync(dir, { recursive: true });
    for (const t of TYPES) {
      writeFileSync(path.join(dir, `${t}.html`), built[t]!.html);
      writeFileSync(path.join(dir, `${t}.txt`), built[t]!.text);
    }
    expect(true).toBe(true);
  });
});
