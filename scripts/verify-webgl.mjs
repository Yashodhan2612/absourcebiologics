/**
 * Verification harness for the 3D layer (Section 7A).
 *
 * scripts/shoot.mjs captures whole pages for design critique. This one drives
 * the WebGL moments specifically: it forces a render tier, waits for each
 * canvas to acquire a context and warm up, scrubs the pinned section, and
 * reports canvas sizes, sustained framerate and console errors alongside the
 * captures.
 *
 *   node scripts/verify-webgl.mjs            # tier 3
 *   TIER=1 node scripts/verify-webgl.mjs     # the honesty check
 *
 * Env: BASE, TIER, WIDTH.
 *
 * Headless Chromium needs SwiftShader to expose WebGL2 and EXT_color_buffer_
 * float. That is a software rasteriser, so the framerate reported here is a
 * floor, not a prediction for real hardware — treat it as "does it run", and
 * measure real devices with ?debug=perf.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE ?? "http://localhost:3300";
const TIER = process.env.TIER ?? "3";
const WIDTH = Number(process.env.WIDTH ?? 1440);
const outDir = ".screens/webgl";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
  ],
});
const context = await browser.newContext({
  viewport: { width: WIDTH, height: Math.round(WIDTH * 0.62) },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 200));
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

const url = `${BASE}/?tier=${TIER}&debug=perf`;
console.log(`→ ${url}`);
await page.goto(url, { waitUntil: "load", timeout: 60000 });

const capabilities = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  return {
    webgl2: !!gl,
    colorBufferFloat: gl ? !!gl.getExtension("EXT_color_buffer_float") : false,
  };
});
console.log("  capabilities:", capabilities);

// Give the deferred mount its idle callback plus the simulation warm-up.
await page.waitForTimeout(4000);

const heroState = await page.evaluate(() => ({
  canvases: [...document.querySelectorAll("canvas")].map((c) => [c.width, c.height]),
  perf: document.getElementById("ab-perf-readout")?.textContent ?? null,
}));
console.log("  hero:", JSON.stringify(heroState));

await page.screenshot({ path: `${outDir}/hero-tier${TIER}.png` });
console.log(`  ${outDir}/hero-tier${TIER}.png`);

// Cumulative layout shift, measured across everything above. Canvases mount
// into fixed-aspect containers, so this must stay under 0.05 (Section 7A.8).
const cls = await page.evaluate(
  () =>
    new Promise((resolve) => {
      let total = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) total += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
      setTimeout(() => resolve(Number(total.toFixed(4))), 600);
    })
);
console.log("  CLS:", cls);

// Scrub the pinned milk-to-curd section and capture it at three points.
const milkTop = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll("section")];
  const section = nodes.find((s) => s.textContent?.includes("holds a clean cut"));
  return section ? section.getBoundingClientRect().top + window.scrollY : null;
});

if (milkTop === null) {
  errors.push("milk-to-curd section not found in the DOM");
} else {
  for (const fraction of [0, 0.5, 0.98]) {
    await page.evaluate(
      ([top, f]) => {
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, top + window.innerHeight * f);
      },
      [milkTop, fraction]
    );
    await page.waitForTimeout(1200);
    const name = `${outDir}/milk-${String(Math.round(fraction * 100)).padStart(3, "0")}-tier${TIER}.png`;
    await page.screenshot({ path: name });
    console.log(`  ${name}`);
  }
}

await browser.close();

if (errors.length) {
  console.error("\nConsole/page errors:");
  for (const e of [...new Set(errors)]) console.error("  " + e);
  process.exit(1);
}
console.log("\nNo console or page errors.");
