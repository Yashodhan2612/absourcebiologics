/**
 * Screenshot harness used to critique each build phase (Section 14).
 *
 * Usage:  node scripts/shoot.mjs <label> <path> [<path> ...]
 * Env:    BASE=http://localhost:3000  WIDTHS=390,768,1440  TIER1=1
 *
 * TIER1=1 forces the render-tier-1 honesty check from Section 7A.9: it sets
 * prefers-reduced-motion: reduce, which the app treats as "no WebGL, no
 * parallax, no ticker". The page must still look finished.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE ?? "http://localhost:3000";
const WIDTHS = (process.env.WIDTHS ?? "390,768,1440").split(",").map(Number);
const TIER1 = process.env.TIER1 === "1";

const [label, ...paths] = process.argv.slice(2);
if (!label || paths.length === 0) {
  console.error("usage: node scripts/shoot.mjs <label> <path> [<path> ...]");
  process.exit(1);
}

const outDir = `.screens/${label}`;
await mkdir(outDir, { recursive: true });

// The image ships a pinned Chromium build that may not match the one this
// Playwright version expects. Prefer the image's binary when it is present.
const PINNED = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const { existsSync } = await import("node:fs");
const browser = await chromium.launch(
  existsSync(PINNED) ? { executablePath: PINNED } : {}
);
const errors = [];

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: Math.round(width * 0.85) },
    deviceScaleFactor: 1,
    reducedMotion: TIER1 ? "reduce" : "no-preference",
  });
  const page = await context.newPage();

  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${width}px] console: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[${width}px] pageerror: ${e.message}`));

  for (const p of paths) {
    const url = `${BASE}${p}`;
    // "load" rather than "networkidle": the StrainIndex ticker animation keeps
    // the page from ever going fully idle, so networkidle would always time out.
    const res = await page.goto(url, { waitUntil: "load", timeout: 45000 });
    await page.waitForTimeout(400);
    if (!res || !res.ok()) errors.push(`${p} -> HTTP ${res ? res.status() : "no response"}`);

    // Settle scroll reveals so the capture shows the page as a reader sees it.
    // scroll-behavior: smooth is disabled first — otherwise each scrollTo
    // animates, the steps never land where they claim to, and the capture
    // fires while reveals are still pending.
    await page.evaluate(async () => {
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          y += Math.round(window.innerHeight * 0.8);
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) setTimeout(step, 120);
          else setTimeout(resolve, 300);
        };
        step();
      });
      window.scrollTo(0, 0);
      root.style.scrollBehavior = previous;
    });
    // Outlast the 500ms reveal transition before capturing.
    await page.waitForTimeout(900);

    const name = (p === "/" ? "home" : p.replace(/[^\w-]/g, "_").replace(/^_/, "")) +
      `-${width}${TIER1 ? "-tier1" : ""}.png`;
    await page.screenshot({ path: `${outDir}/${name}`, fullPage: true });
    console.log(`  ${outDir}/${name}`);
  }

  await context.close();
}

await browser.close();

if (errors.length) {
  console.error("\nPage errors:");
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}
console.log("\nNo console or page errors.");
