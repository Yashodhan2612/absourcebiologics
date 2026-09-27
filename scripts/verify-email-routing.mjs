/**
 * End-to-end proof that every form's notification is actually SENT, and lands
 * at the right inbox.
 *
 * `src/lib/email.test.ts` asserts the routing MAP. This asserts the whole
 * path: a real HTTP POST to the real API route, through the real SMTP client,
 * to a server that records who the message was addressed to. Between them,
 * "the form said thank you but nobody was told" cannot ship.
 *
 * It needs no credentials and no internet. A throwaway SMTP server is started
 * on localhost, the app is pointed at it, and the RCPT TO of every message is
 * captured. That server accepts AUTH PLAIN over an unencrypted connection,
 * which is fine for a loopback catcher and is why it must never be reachable
 * off this machine — it binds 127.0.0.1 explicitly.
 *
 *   node scripts/verify-email-routing.mjs
 *
 * Assumes a production build is already running against the same env. The
 * harness starts one itself, because the server has to be launched with
 * SMTP_HOST pointing at the catcher.
 */
import net from "node:net";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const SMTP_PORT = 2526;
const APP_PORT = 3331;
const BASE = `http://127.0.0.1:${APP_PORT}`;

/* ------------------------------------------------------------ SMTP catcher */

/** Every message the app sent: { from, to[], body }. */
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
        // A lone dot on its own line ends DATA.
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
          // Advertise AUTH so nodemailer will authenticate; deliberately do
          // NOT advertise STARTTLS, so it stays in the clear on loopback.
          socket.write("250-localhost\r\n250-AUTH PLAIN LOGIN\r\n250 OK\r\n");
        } else if (upper.startsWith("AUTH")) {
          socket.write("235 2.7.0 Authentication successful\r\n");
        } else if (upper.startsWith("MAIL FROM")) {
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
        } else {
          socket.write("250 OK\r\n");
        }
      }
    });

    socket.on("error", () => {});
  });

  return new Promise((resolve) => {
    server.listen(SMTP_PORT, "127.0.0.1", () => resolve(server));
  });
}

/* ------------------------------------------------------------- the payloads */

const now = () => Date.now() - 5000; // clear the MIN_SUBMIT_MS timing gate

const CASES = [
  {
    name: "quote request",
    endpoint: "/api/lead",
    expect: "info@absourcebiologics.com",
    body: () => ({
      leadType: "quote",
      name: "QA Tester",
      company: "QA Dairy",
      email: "qa.quote@dairyplant.co.in",
      phone: "+91 90000 00000",
      city: "Pune",
      message: "Routing check.",
      startedAt: now(),
    }),
  },
  {
    name: "contact form",
    endpoint: "/api/lead",
    expect: "info@absourcebiologics.com",
    body: () => ({
      leadType: "contact",
      name: "QA Tester",
      company: "QA Dairy",
      email: "qa.contact@dairyplant.co.in",
      message: "Routing check.",
      startedAt: now(),
    }),
  },
  {
    name: "export enquiry",
    endpoint: "/api/lead",
    expect: "info@absourcebiologics.com",
    body: () => ({
      leadType: "export",
      name: "QA Tester",
      company: "QA Importers",
      email: "qa.export@importer.ae",
      country: "United Arab Emirates",
      role: "importer",
      message: "Routing check.",
      startedAt: now(),
    }),
  },
  {
    name: "culture selector result",
    endpoint: "/api/lead",
    expect: "info@absourcebiologics.com",
    body: () => ({
      leadType: "selector",
      email: "qa.selector@dairyplant.co.in",
      answers: { making: "curd-dahi", texture: "firm-set" },
      matches: ["abdahi"],
      startedAt: now(),
    }),
  },
  {
    name: "careers application",
    endpoint: "/api/lead",
    expect: "hr@absourcebiologics.com",
    body: () => ({
      leadType: "careers",
      name: "QA Candidate",
      email: "qa.careers@example.com",
      role: "Microbiology",
      message: "Routing check.",
      startedAt: now(),
    }),
  },
  {
    name: "vendor audit request",
    endpoint: "/api/lead",
    expect: "qa@absourcebiologics.com",
    body: () => ({
      leadType: "audit",
      name: "QA Auditor",
      company: "QA Dairy Group",
      email: "qa.audit@dairygroup.co.in",
      request: "documentation",
      message: "Routing check.",
      startedAt: now(),
    }),
  },
  {
    name: "data sheet request",
    endpoint: "/api/download",
    expect: "info@absourcebiologics.com",
    body: () => ({
      leadType: "download",
      doc: "abdahi-tds",
      company: "QA Dairy",
      name: "QA Tester",
      role: "qa",
      email: "qa.download@dairyplant.co.in",
      phone: "+91 90000 00000",
      city: "Pune",
      country: "India",
      startedAt: now(),
    }),
  },
];

/* --------------------------------------------------------------------- run */

const smtp = await startSmtpCatcher();
console.log(`SMTP catcher on 127.0.0.1:${SMTP_PORT}`);

const app = spawn("npx", ["next", "start", "-p", String(APP_PORT)], {
  env: {
    ...process.env,
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: String(SMTP_PORT),
    SMTP_USER: "catcher@example.com",
    SMTP_PASS: "catcher",
    LEAD_FROM: "ABsource Biologics <catcher@example.com>",
    DOWNLOAD_SECRET: "routing-test-secret",
  },
  stdio: "ignore",
});

let up = false;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) });
    if (r.ok) { up = true; break; }
  } catch {}
  await sleep(500);
}
if (!up) {
  app.kill("SIGKILL");
  smtp.close();
  console.error("app did not start");
  process.exit(1);
}

let failures = 0;
console.log();

for (const [index, testCase] of CASES.entries()) {
  const before = captured.length;
  const response = await fetch(BASE + testCase.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      /*
       * A distinct client IP per case.
       *
       * The rate limiter allows 5 submissions per hour per IP and is SHARED
       * between /api/lead and /api/download, so running seven cases from one
       * address correctly rejected the last two — the app was right and the
       * first version of this harness was wrong. Giving each case its own
       * address exercises the routing, which is what this file is for, and
       * incidentally proves the limiter keys on IP rather than globally.
       */
      "x-forwarded-for": `203.0.113.${index + 10}`,
    },
    body: JSON.stringify(testCase.body()),
  });
  const json = await response.json().catch(() => ({}));

  // Give the transport a moment to finish both sends.
  for (let i = 0; i < 30 && captured.length === before; i++) await sleep(200);
  await sleep(400);

  const sent = captured.slice(before);
  const notification = sent.find((m) => m.to.some((t) => t.endsWith("absourcebiologics.com")));
  const autoresponse = sent.find((m) => m.to.some((t) => t.includes("@dairyplant") || t.includes("@importer") || t.includes("@example.com") || t.includes("@dairygroup")));

  const landedAt = notification?.to[0];
  const ok = response.ok && json.ok !== false && landedAt === testCase.expect;

  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${testCase.name.padEnd(26)} -> ${landedAt ?? "NOTHING SENT"}` +
      (ok ? "" : `   (expected ${testCase.expect})`)
  );
  if (!ok) failures++;
  else if (!autoresponse) {
    console.log(`       note: no autoresponse to the requester`);
  }
}

app.kill("SIGKILL");
smtp.close();

console.log();
console.log(`${CASES.length - failures}/${CASES.length} notifications delivered to the correct inbox`);
console.log(`${captured.length} messages sent in total (a notification and an autoresponse per lead)`);

if (failures) process.exit(1);
