/**
 * Check the real mail credentials, and optionally send a live test to each
 * ABsource inbox.
 *
 *   node scripts/verify-email.mjs           # connect and authenticate only
 *   node scripts/verify-email.mjs --send    # also send one real test email
 *
 * Run this BEFORE launch and after any change to the mail environment. An SMTP
 * misconfiguration is otherwise invisible: every form still validates, still
 * accepts, still says thank you, and nobody is notified.
 *
 * The transport options below duplicate the ones in src/lib/email.ts on
 * purpose — this script has to run from a laptop with nothing built, so it
 * cannot import the app's TypeScript. If you change the connection settings
 * there, change them here. Nothing else is duplicated: routing itself is
 * covered by src/lib/email.test.ts and scripts/verify-email-routing.mjs.
 */
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT = "465",
  SMTP_USER,
  SMTP_PASS,
  LEAD_FROM,
  SALES_INBOX = "info@absourcebiologics.com",
  HR_INBOX = "hr@absourcebiologics.com",
  QA_INBOX = "qa@absourcebiologics.com",
  EXPORT_INBOX,
} = process.env;

const send = process.argv.includes("--send");
const port = Number(SMTP_PORT);
const from = LEAD_FROM ?? SMTP_USER;

const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing: ${missing.join(", ")}`);
  console.error("\nNothing will be emailed until these are set. For a Gmail account:");
  console.error("  SMTP_HOST=smtp.gmail.com");
  console.error("  SMTP_PORT=465");
  console.error("  SMTP_USER=<the full gmail address>");
  console.error("  SMTP_PASS=<a 16-character App Password, NOT the login password>");
  process.exit(1);
}

console.log(`host   ${SMTP_HOST}:${port} (${port === 465 ? "implicit TLS" : "STARTTLS"})`);
console.log(`user   ${SMTP_USER}`);
console.log(`from   ${from}`);
console.log();

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
});

try {
  await transport.verify();
  console.log("ok   connected and authenticated");
} catch (error) {
  console.error("FAIL", error.message);
  console.error("\nCommon causes:");
  console.error("  - Gmail needs 2-Step Verification ON and an App Password, not the account password.");
  console.error("  - Port 465 needs secure:true, port 587 needs secure:false. Mismatches hang or reject.");
  console.error("  - Some networks block outbound 465/587. Try from the deploy environment, not a laptop.");
  process.exit(1);
}

const inboxes = [
  ["sales / quotes / data sheets", SALES_INBOX],
  ["export", EXPORT_INBOX ?? SALES_INBOX],
  ["careers", HR_INBOX],
  ["vendor audits", QA_INBOX],
];

// One test per mailbox, with every purpose it serves listed. Export normally
// falls back to the sales inbox, so without this the same address is tested
// twice and reported under whichever label happened to come last.
const byAddress = new Map();
for (const [label, addr] of inboxes) {
  byAddress.set(addr, [...(byAddress.get(addr) ?? []), label]);
}
const unique = [...byAddress.entries()].map(([addr, labels]) => [addr, labels.join(", ")]);

if (!send) {
  console.log("\nWould send to:");
  for (const [addr, label] of unique) console.log(`  ${addr.padEnd(32)} ${label}`);
  console.log("\nRe-run with --send to deliver a real test message to each.");
  process.exit(0);
}

console.log();
let failed = 0;
for (const [addr, label] of unique) {
  try {
    const info = await transport.sendMail({
      from,
      to: addr,
      subject: `Test — website form notifications (${label})`,
      html: `<div style="font-family:system-ui,sans-serif;line-height:1.6">
        <p>This is a test from the ABsource Biologics website.</p>
        <p>If you can read this, form notifications for <strong>${label}</strong>
        will arrive at <strong>${addr}</strong>.</p>
        <p style="color:#4A5654">Sent from ${from} at ${new Date().toISOString()}.
        Nothing to action — you can delete it.</p>
      </div>`,
    });
    console.log(`ok   ${addr.padEnd(32)} ${info.messageId ?? ""}`);
  } catch (error) {
    console.error(`FAIL ${addr.padEnd(32)} ${error.message}`);
    failed++;
  }
}

transport.close();
console.log(`\n${unique.length - failed}/${unique.length} test messages accepted for delivery.`);
console.log("Check each inbox, and check its spam folder the first time.");
if (failed) process.exit(1);
