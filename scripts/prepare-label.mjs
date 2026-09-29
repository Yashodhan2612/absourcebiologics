/**
 * Render a printed product label from its PDF to web images.
 *
 *   node scripts/prepare-label.mjs <label.pdf> <slug>
 *   node scripts/prepare-label.mjs "FERMENTA 80 MM X 110 MM CONVRT FILE.pdf" fermenta
 *
 * Writes public/assets/products/cultures/<slug>-label-front.{avif,webp} from
 * page 1 and <slug>-label-back.{avif,webp} from page 2.
 *
 * NEEDS POPPLER (`brew install poppler`) for pdftoppm. That is a build-time
 * tool for whoever prepares assets, not a runtime dependency: the AVIF and
 * WebP outputs are what the repo carries, exactly as with every other image.
 *
 * WHY 300 DPI. The label is vector artwork with one embedded 449x866
 * illustration, so rendering is resolution-independent and there is nothing to
 * upscale. At 80x110mm, 300dpi is 945x1300 — about 2x the width the pack shot
 * is shown at on a product page, which is what a retina screen needs. Going
 * higher only adds bytes.
 *
 * WHY NOT CROP. Every existing pack is a 3:4 photograph; a label is 80:110
 * (0.727). It is shown `object-contain`, so it is not cropped to fit and the
 * printed edge is never lost. Do not add a crop here.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const [pdf, slug] = process.argv.slice(2);
if (!pdf || !slug) {
  console.error("usage: node scripts/prepare-label.mjs <label.pdf> <slug>");
  process.exit(1);
}

const OUT = "public/assets/products/cultures";
const work = mkdtempSync(path.join(tmpdir(), "label-"));

try {
  execFileSync("pdftoppm", ["-r", "300", "-png", pdf, path.join(work, "page")], {
    stdio: "inherit",
  });
} catch {
  console.error("pdftoppm failed. Install poppler: brew install poppler");
  process.exit(1);
}

const pages = readdirSync(work).filter((f) => f.endsWith(".png")).sort();
if (pages.length < 1) {
  console.error("no pages rendered");
  process.exit(1);
}

const faces = [
  ["front", pages[0]],
  ["back", pages[1]],
];

for (const [face, file] of faces) {
  if (!file) {
    console.log(`  (no page for ${face} — skipped)`);
    continue;
  }
  const source = path.join(work, file);
  for (const [format, options] of [
    ["avif", { quality: 60 }],
    ["webp", { quality: 86 }],
  ]) {
    const out = `${OUT}/${slug}-label-${face}.${format}`;
    await sharp(source).toFormat(format, options).toFile(out);
  }
  const { width, height } = await sharp(source).metadata();
  console.log(`  ${slug}-label-${face}  ${width}x${height}`);
}

rmSync(work, { recursive: true, force: true });
