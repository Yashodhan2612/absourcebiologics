/**
 * Does submitting each REAL form, on each page that has one, actually send an
 * email to the right inbox?
 *
 *   pnpm build && node scripts/verify-forms-email.mjs
 *
 * verify-email-routing.mjs proves the API route and the routing map by posting
 * JSON. This goes one layer further out: it drives the actual on-page forms in
 * a browser, the way a visitor does, so it also catches a field that never
 * reaches the payload, a form that shows "thanks" without sending, or a page
 * whose form was never wired to the API.
 *
 * It needs no credentials and no internet. A throwaway SMTP server is started
 * on loopback, a production build is launched pointed at it, and every message
 * is captured: who it was addressed to, who it was from, and its body.
 *
 * Second half: the same submission with SMTP deliberately NOT configured, and
 * then with SMTP unreachable. Both still show the visitor a success message,
 * by design, so the only way to know email is down is that nothing arrives —
 * which is exactly what this proves, and why the deploy checklist in README.md
 * has a "send a real test" step.
 */
import net from "node:net";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

const SMTP_PORT = 2527;
const APP_PORT = 3332;
const BASE = `http://127.0.0.1:${APP_PORT}`;
const MIN_SUBMIT_MS = 2000;

/* ------------------------------------------------------------ SMTP catcher */

const captured = [];

function startSmtpCatcher() {
  const server = net.createServer((socket) => {
    let stage = "cmd";
    let current = { from: null, to: [], body: "" };
    socket.write("220 localhost ESMTP catcher\r\n");
    socket.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      if (stage === "data") {
        current.body += text;
        if (/\r\n\.\r\n$/.test(current.body)) {
          current.body = current.body.replace(/\r\n\.\r\n$/, "");
          captured.push(current);
          current = { from: null, to: [], body: "" };
          stage = "cmd";
          socket.write("250 OK queued\r\n");
        }
        return;
      }
      for (const line of text.split("\r\n").filter(Boolean)) {
        const upper = line.toUpperCase();
        if (upper.startsWith("EHLO") || upper.startsWith("HELO")) {
          socket.write("250-localhost\r\n250-AUTH PLAIN LOGIN\r\n250 OK\r\n");
        } else if (upper.startsWith("AUTH")) socket.write("235 2.7.0 Authentication successful\r\n");
        else if (upper.startsWith("MAIL FROM")) {
          current.from = line.slice(line.indexOf(":") + 1).trim();
          socket.write("250 OK\r\n");
        } else if (upper.startsWith("RCPT TO")) {
          current.to.push(line.slice(line.indexOf(":") + 1).trim().replace(/[<>]/g, ""));
          socket.write("250 OK\r\n");
        } else if (upper === "DATA") {
          stage = "data";
          socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
        } else if (upper.startsWith("QUIT")) {
          socket.write("221 Bye\r\n");
          socket.end();
        } else socket.write("250 OK\r\n");
      }
    });
    socket.on("error", () => {});
  });
  return new Promise((resolve) => server.listen(SMTP_PORT, "127.0.0.1", () => resolve(server)));
}

/* ------------------------------------------------------------------ the app */

async function startApp(env) {
  const child = spawn("pnpm", ["exec", "next", "start", "-p", String(APP_PORT), "-H", "127.0.0.1"], {
    env: { ...process.env, ...env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return { child, logs: () => log };
    } catch {}
    await sleep(500);
  }
  child.kill();
  throw new Error("app did not start:\n" + log.slice(-600));
}

const stopApp = async (app) => {
  app.child.kill("SIGTERM");
  await sleep(800);
};

/* ------------------------------------------------------------ form driving */

let ipCounter = 10;

/** A fresh browser context per submission, each from its own client address,
 *  so the 5-per-hour rate limit never decides the result. */
async function newPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: { "x-forwarded-for": `203.0.113.${ipCounter++}` },
  });
  return { page: await context.newPage(), context };
}

/** Fill every visible field in the form that holds the submit button. */
async function fillForm(page, scope, email) {
  const labels = await scope.locator("label").all();
  for (const label of labels) {
    const text = ((await label.innerText().catch(() => "")) || "").replace(/\s*\*?\s*$/, "").trim();
    // The honeypot. It is positioned off-screen rather than hidden, so a
    // browser reports it visible; a person never sees it, and filling it makes
    // the server treat the submission as a bot and drop it with a quiet 200.
    if (!text || /do not fill/i.test(text)) continue;
    const field = scope.getByLabel(text, { exact: false }).first();
    if (!(await field.count()) || !(await field.isVisible().catch(() => false))) continue;
    const tag = await field.evaluate((el) => el.tagName.toLowerCase()).catch(() => "");
    const type = await field.evaluate((el) => el.type ?? "").catch(() => "");
    if (tag === "select") {
      await field.selectOption({ index: 1 }).catch(() => {});
    } else if (type === "checkbox" || type === "radio") {
      await field.check().catch(() => {});
    } else if (type === "file") {
      continue;
    } else {
      const value = /email/i.test(text)
        ? email
        : /phone/i.test(text)
          ? "+91 90000 00000"
          : /company/i.test(text)
            ? "QA Dairy Pvt Ltd"
            : /name/i.test(text)
              ? "QA Tester"
              : /city|country/i.test(text)
                ? "Pune"
                : /volume/i.test(text)
                  ? "500 L per day"
                  : "QA harness submission. Please ignore.";
      await field.fill(value).catch(() => {});
    }
  }
}

/** Submit a form, walking a multi-step shell if there is one. */
async function submitForm(page, scope, email, submitName) {
  const mounted = Date.now();
  for (let step = 0; step < 6; step++) {
    await fillForm(page, scope, email);
    // Stop as soon as the real submit button is showing.
    if (await scope.getByRole("button", { name: submitName }).count()) break;
    const next = scope.getByRole("button", { name: /^(next|continue)/i }).first();
    if (!(await next.count())) break;
    await next.click().catch(() => {});
    await page.waitForTimeout(400);
  }
  // The anti-spam timing gate answers 200 and silently drops anything faster
  // than two seconds, which would read as a pass.
  const waited = Date.now() - mounted;
  if (waited < MIN_SUBMIT_MS + 600) await page.waitForTimeout(MIN_SUBMIT_MS + 600 - waited);
  await scope.getByRole("button", { name: submitName }).last().click({ timeout: 8000 });
}

/* ---------------------------------------------------------------- the cases */

const SALES = "info@absourcebiologics.com";
const CASES = [
  { slug: "contact", path: "/contact", to: SALES, submit: /send message/i },
  // Multi-step: its first step has no email field, so find it as "the form".
  { slug: "quote", path: "/request-a-quote", to: SALES, submit: /send my spec/i, anyForm: true },
  { slug: "quote-from-product", path: "/request-a-quote?sku=abdahi", to: SALES, submit: /send my spec/i, anyForm: true },
  { slug: "export", path: "/export", to: SALES, submit: /send export enquiry/i },
  { slug: "careers", path: "/careers", to: "hr@absourcebiologics.com", submit: /send application/i },
  { slug: "audit", path: "/quality", to: "qa@absourcebiologics.com", submit: /send the request/i },
  { slug: "service-custom-culture", path: "/services/custom-culture-development", to: SALES, submit: /send message/i },
  { slug: "service-turnkey", path: "/services/turnkey-plant-setup", to: SALES, submit: /send message/i },
  { slug: "service-product-dev", path: "/services/custom-product-development", to: SALES, submit: /send message/i },
  {
    slug: "download",
    path: "/downloads",
    to: SALES,
    submit: /request the data sheet/i,
    before: async (page) => {
      await page.getByRole("button", { name: /request/i }).first().click();
      await page.waitForTimeout(500);
    },
  },
  {
    slug: "selector",
    path: "/culture-selector?making=cheese&style=mozzarella&step=3",
    to: SALES,
    submit: /email me this/i,
    scopeText: "Email me this recommendation",
  },
];

const emailFor = (c, tag) => `qa-${tag}-${c.slug}@dairyplant.co.in`;

async function run(browser, tag, { expectMail }) {
  const rows = [];
  for (const c of CASES) {
    const before = captured.length;
    const { page, context } = await newPage(browser);
    const email = emailFor(c, tag);
    // What the visitor is told comes from the API's own answer, not from
    // matching words on the page (ordinary page copy says "we will ..." too).
    let shown = false;
    let delivered = null;
    let error = null;
    page.on("response", async (r) => {
      if (!/\/api\/(lead|download)$/.test(new URL(r.url()).pathname) || r.request().method() !== "POST") return;
      const json = await r.json().catch(() => ({}));
      if (r.status() === 200 && json.ok) {
        shown = true;
        delivered = json.delivered ?? null;
      }
    });
    try {
      await page.goto(BASE + c.path, { waitUntil: "load" });
      await page.waitForTimeout(700);
      if (c.before) await c.before(page);
      // The form is the one that holds this page's form fields, found from its
      // first field rather than its submit button, because a multi-step form
      // only shows its submit button on the last step.
      const scope = (c.anyForm
        ? page.locator("main form").first()
        : page.locator("main form").filter({ has: page.getByLabel(/email/i) }).last());
      await scope.waitFor({ state: "visible", timeout: 8000 });
      await submitForm(page, scope, email, c.submit);
      await page.waitForTimeout(3500);
    } catch (e) {
      error = String(e.message ?? e).split("\n")[0].slice(0, 140);
    }
    await sleep(500);
    const mine = captured.slice(before).filter((m) => m.body.includes(email) || m.to.includes(email));
    const notification = mine.find((m) => m.to.includes(c.to));
    const autoresponse = mine.find((m) => m.to.includes(email));
    rows.push({ c, shown, delivered, error, notification, autoresponse, count: mine.length });
    await context.close();
  }
  return rows;
}

const mark = (ok) => (ok ? "ok  " : "FAIL");
let failures = 0;
const check = (ok, text) => {
  if (!ok) failures++;
  console.log(`  ${mark(ok)} ${text}`);
};

/* --------------------------------------------------------------------- main */

const smtp = await startSmtpCatcher();
const browser = await chromium.launch();

console.log("A. SMTP configured (loopback catcher)\n");
let app = await startApp({
  SMTP_HOST: "127.0.0.1",
  SMTP_PORT: String(SMTP_PORT),
  SMTP_USER: "relay@example.test",
  SMTP_PASS: "not-a-real-password",
  // Pin the real production inboxes explicitly so the test does not depend on
  // the code defaults being unchanged.
  SALES_INBOX: SALES,
  HR_INBOX: "hr@absourcebiologics.com",
  QA_INBOX: "qa@absourcebiologics.com",
});
const on = await run(browser, "on", { expectMail: true });
for (const r of on) {
  const where = `${r.c.slug.padEnd(24)} ${r.c.path}`;
  check(
    r.shown && r.notification,
    `${where}  ->  ${r.notification ? r.c.to : "NO EMAIL"}${r.shown ? "" : "  (no success message)"}${r.error ? "  " + r.error : ""}`
  );
}
console.log("");
const withAuto = on.filter((r) => r.autoresponse).length;
check(withAuto === on.length, `visitor autoresponse sent for ${withAuto}/${on.length} forms`);
const replyTo = on.every((r) => !r.notification || /reply-to:[^\r\n]*qa-on-/i.test(r.notification.body));
check(replyTo, "every notification's Reply-To is the visitor, so replying reaches them");

// The confirmation the visitor receives: how it looks on the wire.
const autos = on.map((r) => r.autoresponse).filter(Boolean);
check(
  autos.every((m) => /^From:[^\r\n]*ABsource Biologics/im.test(m.body)),
  'confirmation is sent from "ABsource Biologics", not a bare mailbox'
);
check(
  autos.every((m) => /multipart\/alternative/i.test(m.body) && /text\/plain/i.test(m.body) && /text\/html/i.test(m.body)),
  "confirmation carries both an HTML and a plain-text part"
);
check(
  autos.every((m) => /^Reply-To:[^\r\n]*(info|hr|qa)@absourcebiologics\.com/im.test(m.body)),
  "replying to the confirmation reaches the owning team (info@, hr@ or qa@)"
);
const subjects = new Set(autos.map((m) => /^Subject:\s*(.+)$/im.exec(m.body)?.[1]));
check(subjects.size >= 6, `confirmations use ${subjects.size} different subject lines by form type`);
await stopApp(app);

console.log("\nB. SMTP NOT configured (what a deploy with no env vars does)\n");
app = await startApp({ SMTP_HOST: "", SMTP_USER: "", SMTP_PASS: "" });
captured.length = 0;
const off = await run(browser, "off", { expectMail: false });
const shownOff = off.filter((r) => r.shown).length;
check(shownOff === off.length, `visitor still sees a success message on ${shownOff}/${off.length} forms`);
check(captured.length === 0, `emails sent: ${captured.length}  (nobody is notified; the lead is only in the server log)`);
check(/lead|submitted/i.test(app.logs()), "the lead is written to the server log instead");
await stopApp(app);

console.log("\nC. SMTP configured but UNREACHABLE (wrong host, port or password)\n");
app = await startApp({ SMTP_HOST: "127.0.0.1", SMTP_PORT: "2599", SMTP_USER: "x", SMTP_PASS: "y" });
captured.length = 0;
const bad = await run(browser, "bad", { expectMail: false });
const shownBad = bad.filter((r) => r.shown).length;
check(shownBad === bad.length, `visitor still sees a success message on ${shownBad}/${bad.length} forms`);
check(captured.length === 0, `emails sent: ${captured.length}`);
await stopApp(app);

await browser.close();
smtp.close();

console.log(
  failures
    ? `\n${failures} check(s) failed.`
    : "\nEvery form on every page sends its email to the right inbox when SMTP is configured." +
        "\nWithout working SMTP the visitor is thanked and nobody is told — so SMTP_* must be set in production."
);
process.exit(failures ? 1 : 0);
