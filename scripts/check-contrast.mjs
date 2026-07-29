/**
 * WCAG 2.2 contrast verification for the ABsource palette.
 *
 * Section 12 requires contrast to be tested, not assumed, and specifically
 * calls out that ab-ghee on ab-milk will fail. This script proves which pairs
 * are usable for body text (>= 4.5:1) and which only clear large text (>= 3:1).
 *
 * Run: node scripts/check-contrast.mjs
 * Exits non-zero if a pair marked `required` fails, so CI can gate on it.
 */

const TOKENS = {
  "ab-ink": "#0C1413",
  "ab-ink-60": "#4A5654",
  "ab-tank": "#0B3B3C",
  "ab-tank-600": "#135052",
  "ab-tank-300": "#7FA9A9",
  "ab-chill": "#DCE7E7",
  "ab-milk": "#FBFAF7",
  "ab-white": "#FFFFFF",
  "ab-ghee": "#E4A33B",
  "ab-ghee-dark": "#986615",
  "ab-culture": "#6FBF6B",
  "ab-alert": "#C0442E",
};

const srgbToLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(
    (v) => srgbToLinear(v / 255)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** `required` pairs gate the build. `informational` pairs are reported only. */
const PAIRS = [
  // Body copy is always ab-ink on ab-milk or ab-white.
  { fg: "ab-ink", bg: "ab-milk", use: "body copy", required: 4.5 },
  { fg: "ab-ink", bg: "ab-white", use: "body copy on cards", required: 4.5 },
  { fg: "ab-ink-60", bg: "ab-milk", use: "secondary copy", required: 4.5 },
  { fg: "ab-ink", bg: "ab-chill", use: "copy on chill bands", required: 4.5 },

  // Reversed sections use ab-tank background with ab-milk text.
  { fg: "ab-milk", bg: "ab-tank", use: "reversed body copy", required: 4.5 },
  { fg: "ab-tank-300", bg: "ab-tank", use: "reversed secondary", required: 3 },

  // The ghee accent. ab-ghee is expected to FAIL as text on light — that is
  // exactly why ab-ghee-dark exists.
  { fg: "ab-ghee-dark", bg: "ab-milk", use: "accent TEXT on light", required: 4.5 },
  { fg: "ab-ghee-dark", bg: "ab-white", use: "accent TEXT on white", required: 4.5 },
  { fg: "ab-ink", bg: "ab-ghee", use: "text on filled ghee button", required: 4.5 },
  { fg: "ab-ghee", bg: "ab-tank", use: "accent text on reversed", required: 4.5 },
  { fg: "ab-ghee", bg: "ab-milk", use: "accent text on light (EXPECTED FAIL)", informational: true },

  // Focus ring must be visible against every surface it lands on (>= 3:1).
  { fg: "ab-ghee-dark", bg: "ab-milk", use: "focus ring on light", required: 3 },
  { fg: "ab-ghee", bg: "ab-tank", use: "focus ring on reversed", required: 3 },

  // Live/active state.
  { fg: "ab-culture", bg: "ab-tank", use: "active state on reversed", required: 3 },
  { fg: "ab-alert", bg: "ab-milk", use: "error text", required: 4.5 },
];

let failed = 0;
const rows = [];

for (const pair of PAIRS) {
  const r = ratio(TOKENS[pair.fg], TOKENS[pair.bg]);
  const need = pair.required ?? 0;
  const pass = pair.informational ? null : r >= need;
  if (pass === false) failed++;
  rows.push({
    pair: `${pair.fg} on ${pair.bg}`,
    ratio: `${r.toFixed(2)}:1`,
    needs: pair.informational ? "—" : `${need}:1`,
    status: pair.informational ? (r >= 4.5 ? "info ok" : "info FAILS (expected)") : pass ? "PASS" : "FAIL",
    use: pair.use,
  });
}

console.table(rows);

if (failed > 0) {
  console.error(`\n${failed} required contrast pair(s) FAILED. Fix the tokens.`);
  process.exit(1);
}
console.log("\nAll required contrast pairs pass WCAG 2.2 AA.");
