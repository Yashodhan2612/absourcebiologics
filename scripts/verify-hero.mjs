/**
 * Capture and check the hero's Streptococcus field.
 *
 * The formation — chains laying themselves down left to right on load — is the
 * whole point of this background, and a single screenshot cannot show whether
 * it works, so this samples the sweep. It also measures the contrast of the
 * hero copy against the field, which matters because the field is a saturated
 * magenta sitting behind body text.
 *
 *   node scripts/verify-hero.mjs
 *   TIER=1 node scripts/verify-hero.mjs     # the static poster
 *
 * CONTRAST METHOD. The background under the copy is not flat ab-milk — it is
 * the canvas composited under a gradient scrim — so the token values tell you
 * nothing. Reading the canvas back with gl.readPixels does not work either:
 * without preserveDrawingBuffer the buffer is empty by the time you ask, and
 * you silently measure ab-milk and get a reassuring number that means nothing.
 * So this screenshots the page twice, once with the copy hidden, and samples
 * the real composited pixels behind each text box.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const BASE = process.env.BASE ?? "http://localhost:3330";
const TIER = process.env.TIER ?? "3";
const outDir = ".screens/hero";
await mkdir(outDir, { recursive: true });

const relativeLuminance = ([r, g, b]) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

const errors = [];
const failures = [];
const VIEWPORTS = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "phone", width: 390, height: 844 },
];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`[${vp.label}] ${m.text().slice(0, 160)}`));
  page.on("pageerror", (e) => errors.push(`[${vp.label}] pageerror: ${e.message.slice(0, 160)}`));

  await page.goto(`${BASE}/?tier=${TIER}`, { waitUntil: "load" });

  // Sample the formation sweep, then let it settle. SwiftShader renders this
  // at a few frames a second, so "settled" needs real wall-clock patience —
  // on hardware the formation is done inside three seconds.
  const clip = { x: 0, y: 0, width: vp.width, height: vp.height };
  for (const at of [800, 1600, 2800]) {
    await page.waitForTimeout(at === 800 ? at : 900);
    await page.screenshot({ path: `${outDir}/${vp.label}-tier${TIER}-${at}ms.png`, clip });
  }
  await page.waitForTimeout(20000);
  const settledPath = `${outDir}/${vp.label}-tier${TIER}-settled.png`;
  await page.screenshot({ path: settledPath, clip });
  console.log(`  ${settledPath}`);

  const canvases = await page.evaluate(() =>
    [...document.querySelectorAll("canvas")].map((c) => [c.width, c.height])
  );
  console.log(`  ${vp.label} canvases: ${JSON.stringify(canvases)}`);

  // Text boxes and their colours, then the same frame with the copy hidden.
  const targets = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("h1, .container-ab p, .container-ab span")]
      .filter((el) => el.getBoundingClientRect().width > 0 && el.textContent.trim())
      .slice(0, 6);
    nodes.forEach((el, i) => el.setAttribute("data-contrast-probe", String(i)));
    return nodes.map((el) => {
      const b = el.getBoundingClientRect();
      return {
        text: el.textContent.trim().slice(0, 34),
        color: getComputedStyle(el).color.match(/\d+/g).slice(0, 3).map(Number),
        large: parseFloat(getComputedStyle(el).fontSize) >= 24,
        box: { x: b.left, y: b.top, w: b.width, h: b.height },
      };
    });
  });

  await page.evaluate(() => {
    for (const el of document.querySelectorAll("[data-contrast-probe]")) {
      el.style.visibility = "hidden";
    }
  });
  const bareBuf = await page.screenshot({ clip });
  const bare = sharp(bareBuf);
  const { data, info } = await bare.raw().toBuffer({ resolveWithObject: true });

  let worst = { ratio: Infinity, text: "", required: 4.5 };
  for (const t of targets) {
    const required = t.large ? 3 : 4.5;
    // Sample across the box: the gradient means the right end of a line sits
    // over far more colour than the left.
    for (let fx = 0; fx <= 1; fx += 0.125) {
      for (let fy = 0.25; fy <= 0.75; fy += 0.25) {
        const px = Math.round(t.box.x + t.box.w * fx);
        const py = Math.round(t.box.y + t.box.h * fy);
        if (px < 0 || py < 0 || px >= info.width || py >= info.height) continue;
        const i = (py * info.width + px) * info.channels;
        const bg = [data[i], data[i + 1], data[i + 2]];
        const r = contrast(t.color, bg);
        if (r < worst.ratio) worst = { ratio: r, text: t.text, required };
        if (r < required) {
          failures.push(
            `[${vp.label}] "${t.text}" ${r.toFixed(2)}:1 at (${px},${py}), needs ${required}:1`
          );
        }
      }
    }
  }
  console.log(
    `  ${vp.label} worst copy contrast over the field: ${worst.ratio.toFixed(2)}:1 ` +
      `(needs ${worst.required}:1) — "${worst.text}"`
  );

  await context.close();
}

await browser.close();

if (errors.length) {
  console.error("\nConsole/page errors:");
  for (const e of [...new Set(errors)]) console.error("  " + e);
}
if (failures.length) {
  console.error(`\n${failures.length} contrast failure(s):`);
  for (const f of [...new Set(failures)].slice(0, 12)) console.error("  " + f);
}
if (errors.length || failures.length) process.exit(1);
console.log("\nNo errors. All hero copy clears WCAG AA over the field.");
