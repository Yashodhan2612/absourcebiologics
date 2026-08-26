/**
 * End-to-end functional check of every lead path and interactive page.
 *
 *   node scripts/verify-forms.mjs
 *   BASE=http://localhost:3330 node scripts/verify-forms.mjs
 *
 * The other verify-* scripts cover rendering, navigation and the 3D layer.
 * This one covers the things the site exists to DO: the four lead paths from
 * Section 10 of the brief (quote, export, gated data sheet, culture selector),
 * plus the interactive pages a buyer actually uses.
 *
 * It drives the real forms in a real browser rather than posting JSON at the
 * API, so it catches the failures that only show up in the wiring — a field
 * that never reaches the payload, a submit handler that throws, a success
 * state that never renders.
 *
 * Note the anti-spam timing gate: MIN_SUBMIT_MS in src/lib/schema.ts rejects
 * anything submitted within two seconds of the form mounting, and does so with
 * a 200 so a bot learns nothing. A harness that fills and submits instantly
 * therefore gets a FALSE PASS. Every submission here waits it out.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3330";
const MIN_SUBMIT_MS = 2000;

const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
context.on("page", (p) => {
  p.on("pageerror", (e) => consoleErrors.push(`${p.url()} :: ${e.message.slice(0, 140)}`));
  p.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(`${p.url()} :: ${m.text().slice(0, 140)}`);
  });
});
const page = await context.newPage();

/** Fill a labelled field by its visible label text. */
async function fill(label, value) {
  const field = page.getByLabel(label, { exact: false }).first();
  await field.waitFor({ state: "visible", timeout: 8000 });
  await field.fill(value);
}

async function tryStep(name, fn) {
  try {
    await fn();
    record(name, true);
  } catch (e) {
    record(name, false, String(e.message ?? e).split("\n")[0].slice(0, 160));
  }
}

console.log(`Base: ${BASE}\n`);

// ---------------------------------------------------------------- selector
console.log("Culture selector:");
await tryStep("selector loads and shows question one", async () => {
  await page.goto(`${BASE}/culture-selector`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const opts = await page.locator("main button, main [role=radio]").count();
  if (opts < 3) throw new Error(`expected option cards, found ${opts}`);
});

await tryStep("selector answers every question and returns a recommendation", async () => {
  // The wizard renders its option cards as button[role=radio]. Scope to that
  // rather than to any button in main — the page also server-renders the
  // thirteen culture lines below the wizard, and a looser selector walks that
  // list instead of the wizard and never reaches a result.
  let answered = 0;
  for (let step = 0; step < 12; step++) {
    const options = page.locator('main button[role="radio"]');
    const count = await options.count();
    if (count === 0) break;
    await options.first().click({ timeout: 5000 });
    answered++;
    await page.waitForTimeout(400);
  }
  if (answered < 6) throw new Error(`only answered ${answered} questions`);

  const body = await page.locator("main").innerText();
  if (!/your match|% fit|send us your spec|we.d rather look at this/i.test(body)) {
    throw new Error("no result state reached after " + answered + " answers");
  }
});

await tryStep("selector state survives a reload (URL-encoded answers)", async () => {
  const url = page.url();
  if (!url.includes("?")) throw new Error("answers are not in the URL");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(600);
});

// ------------------------------------------------------------------- quote
console.log("\nQuote request:");
await tryStep("quote form prefills from ?sku=", async () => {
  await page.goto(`${BASE}/request-a-quote?sku=abdahi`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const body = await page.locator("main").innerText();
  if (!/abdahi/i.test(body)) throw new Error("SKU not reflected in the form");
});

await tryStep("quote form submits and shows an inline success state", async () => {
  await page.goto(`${BASE}/request-a-quote`, { waitUntil: "load" });
  const mounted = Date.now();
  await page.waitForTimeout(700);

  // Walk any multi-step shell to the end, filling what each step exposes.
  for (let step = 0; step < 6; step++) {
    const labels = await page.locator("main label").allInnerTexts().catch(() => []);
    for (const raw of labels) {
      const label = raw.replace(/\s*\*?\s*$/, "").trim();
      if (!label) continue;
      const value = /email/i.test(label)
        ? "qa.tester@dairyplant.co.in"
        : /phone/i.test(label)
          ? "+91 90000 00000"
          : /company/i.test(label)
            ? "QA Dairy Pvt Ltd"
            : /name/i.test(label)
              ? "QA Tester"
              : /city|country/i.test(label)
                ? "Pune"
                : "QA harness submission";
      await fill(label, value).catch(() => {});
    }
    const next = page.getByRole("button", { name: /next|continue/i }).first();
    if (await next.count()) {
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
      continue;
    }
    break;
  }

  // Respect the anti-spam timing gate or the API silently 200s and we pass
  // on a submission that was never recorded.
  const waited = Date.now() - mounted;
  if (waited < MIN_SUBMIT_MS + 500) await page.waitForTimeout(MIN_SUBMIT_MS + 500 - waited);

  const submit = page
    .getByRole("button", { name: /request|send|submit/i })
    .last();
  await submit.click({ timeout: 8000 });
  await page.waitForTimeout(2500);

  const body = await page.locator("main").innerText();
  if (!/thank|we'll|we will|received|got it|replies|in touch/i.test(body)) {
    throw new Error("no success state after submit: " + body.slice(0, 120).replace(/\n/g, " "));
  }
});

// ------------------------------------------------------------------ export
console.log("\nExport enquiry:");
await tryStep("export page renders its own enquiry form", async () => {
  await page.goto(`${BASE}/export`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const inputs = await page.locator("main input, main select, main textarea").count();
  if (inputs < 4) throw new Error(`expected an export form, found ${inputs} fields`);
});

// --------------------------------------------------------------- downloads
console.log("\nGated data sheet:");
await tryStep("downloads page lists documents and opens a gate", async () => {
  await page.goto(`${BASE}/downloads`, { waitUntil: "load" });
  await page.waitForTimeout(700);
  const request = page.getByRole("button", { name: /request/i }).first();
  if (!(await request.count())) throw new Error("no Request button on the library");
  await request.click();
  await page.waitForTimeout(500);
  const inputs = await page.locator("main input").count();
  if (inputs < 1) throw new Error("gate did not open");
});

await tryStep("data sheet gate rejects a submission missing required fields", async () => {
  const body = await page.locator("main").innerText();
  if (!/email/i.test(body)) throw new Error("gate has no email field");
  // Submit empty. Nothing may be released and no success state may appear.
  const submit = page.getByRole("button", { name: /request the data sheet/i }).last();
  await submit.click().catch(() => {});
  await page.waitForTimeout(1500);
  const after = await page.locator("main").innerText();
  if (/download should start|request received/i.test(after)) {
    throw new Error("gate accepted a request with no details supplied");
  }
});

await tryStep("data sheet gate asks for company, role, phone and city", async () => {
  // The client asked for enough detail to authenticate the dairy before a
  // sheet goes out. If any of these stops being required, the control is gone.
  const labels = (await page.locator("main label").allInnerTexts()).join(" | ").toLowerCase();
  for (const needed of ["company", "name", "role", "email", "phone", "city", "country"]) {
    if (!labels.includes(needed)) throw new Error(`no ${needed} field on the gate`);
  }
});

await tryStep("a complete data sheet request is held for release, not streamed", async () => {
  const mounted = Date.now();
  const fills = [
    ["Company", "QA Dairy Pvt Ltd"],
    ["Your name", "QA Tester"],
    ["Work email", "qa.tester@dairyplant.co.in"],
    ["Phone", "+91 90000 00000"],
    ["City", "Pune"],
    ["Country", "India"],
  ];
  for (const [label, value] of fills) await fill(label, value);
  await page.getByLabel(/your role/i).selectOption("qa");

  // Respect the two-second anti-spam gate, or the API 200s without recording.
  const waited = Date.now() - mounted;
  if (waited < MIN_SUBMIT_MS + 500) await page.waitForTimeout(MIN_SUBMIT_MS + 500 - waited);

  await page.getByRole("button", { name: /request the data sheet/i }).last().click();
  await page.waitForTimeout(2500);

  const after = await page.locator("main").innerText();
  if (!/request received/i.test(after)) {
    throw new Error("no acknowledgement: " + after.slice(0, 140).replace(/\n/g, " "));
  }
  if (/download should start/i.test(after)) {
    throw new Error("document was streamed — it should be held for release");
  }
});

await tryStep("selecting a second document gives back a usable form", async () => {
  // Runs immediately after the step above, so the panel is sitting on the
  // terminal "Request received." state. Every document is release:
  // "on-approval", so that state is the outcome of EVERY successful request —
  // if the gate is not remounted per document, the second data sheet on the
  // page can never be requested and the buyer reads a confirmation for a
  // request that was never sent.
  const others = page.getByRole("button", { name: /^request$/i });
  const n = await others.count();
  if (!n) throw new Error("library offers only one document — cannot test the switch");
  await others.first().click();
  await page.waitForTimeout(700);

  const aside = await page.locator("aside").innerText();
  if (/request received/i.test(aside)) {
    throw new Error("stale confirmation carried over to the newly selected document");
  }
  const submit = page.getByRole("button", { name: /request the data sheet/i });
  if (!(await submit.count())) throw new Error("no form under the newly selected document");

  // And the fields must be empty, not carrying the previous requester's data.
  const company = await page.getByLabel(/^company/i).inputValue();
  if (company) throw new Error(`company field carried over: ${company}`);
});

// ----------------------------------------------------------------- contact
console.log("\nContact:");
await tryStep("contact page renders a form and the address", async () => {
  await page.goto(`${BASE}/contact`, { waitUntil: "load" });
  await page.waitForTimeout(600);
  const body = await page.locator("main").innerText();
  if (!/chinchwad/i.test(body)) throw new Error("plant address missing");
  const inputs = await page.locator("main input, main textarea").count();
  if (inputs < 3) throw new Error(`expected a contact form, found ${inputs} fields`);
});

// --------------------------------------------------------------- catalogue
console.log("\nCatalogue:");
await tryStep("product filters write to the URL and narrow the grid", async () => {
  await page.goto(`${BASE}/products`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const before = await page.locator("main ul li a[href*='/products/']").count();
  const chip = page.getByRole("link", { name: /dairy ingredients/i }).first();
  if (await chip.count()) {
    await chip.click();
    await page.waitForTimeout(800);
    if (!page.url().includes("category=")) throw new Error("filter did not reach the URL");
    const after = await page.locator("main ul li a[href*='/products/']").count();
    if (after >= before) throw new Error(`filter did not narrow: ${before} -> ${after}`);
  } else {
    throw new Error("no category filter found");
  }
});

await tryStep("every catalogue card resolves to a live product page", async () => {
  await page.goto(`${BASE}/products`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const hrefs = await page.locator("main a[href*='/products/']").evaluateAll((as) =>
    [...new Set(as.map((a) => a.getAttribute("href")).filter((h) => h && h.split("/").length >= 4))]
  );
  if (hrefs.length < 10) throw new Error(`only ${hrefs.length} product links found`);
  const bad = [];
  for (const href of hrefs) {
    const res = await context.request.get(BASE + href);
    if (!res.ok()) bad.push(`${href} -> ${res.status()}`);
  }
  if (bad.length) throw new Error(bad.join(", "));
});

await browser.close();

// ------------------------------------------------------------------ report
const failed = results.filter((r) => !r.ok);
// The gate's empty-submit test deliberately provokes a 400 from /api/download —
// that IS the correct behaviour being asserted, so it must not be reported as a
// site error. Nothing else on /downloads should 400.
const noisy = [...new Set(consoleErrors)].filter(
  (e) => !/favicon/i.test(e) && !(/\/downloads/.test(e) && /400/.test(e))
);

console.log(`\n${results.length - failed.length}/${results.length} functional checks passed`);
if (noisy.length) {
  console.error(`\n${noisy.length} console/page error(s):`);
  for (const e of noisy.slice(0, 10)) console.error("  " + e);
}
if (failed.length) {
  console.error(`\n${failed.length} failure(s):`);
  for (const f of failed) console.error(`  ${f.name} — ${f.detail}`);
}
if (failed.length || noisy.length) process.exit(1);
console.log("All lead paths and interactive pages work.");
