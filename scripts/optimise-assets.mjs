/**
 * Convert everything under public/assets/_source/ to AVIF and WebP at 1x/2x.
 *
 * Run after scripts/fetch-assets.sh. Idempotent — existing outputs are skipped
 * unless the source is newer, so re-running is cheap.
 */
import sharp from "sharp";
import { readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "public/assets/_source";
const OUT = "public/assets";
const WIDTHS = [
  { suffix: "", scale: 1 },
  { suffix: "@2x", scale: 2 },
];
const RASTER = new Set([".jpg", ".jpeg", ".png"]);

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function isStale(source, target) {
  try {
    const [s, t] = await Promise.all([stat(source), stat(target)]);
    return s.mtimeMs > t.mtimeMs;
  } catch {
    return true;
  }
}

let converted = 0;
let skipped = 0;

for await (const file of walk(SRC)) {
  const ext = path.extname(file).toLowerCase();
  if (!RASTER.has(ext)) continue;

  const relative = path.relative(SRC, file);
  const base = path.join(OUT, relative).replace(/\.[^.]+$/, "");
  await mkdir(path.dirname(base), { recursive: true });

  const image = sharp(file);
  const { width } = await image.metadata();
  if (!width) continue;

  for (const { suffix, scale } of WIDTHS) {
    // Never upscale — a 2x of an already-small source is wasted bytes.
    const target = Math.min(width, Math.round(width * scale));

    // If 2x resolves to the same width as 1x — which it does for every asset
    // scraped from the live site, since none of them are large enough to
    // usefully double — writing it produces a byte-identical duplicate. That
    // was silently doubling the committed asset weight.
    if (scale !== 1 && target === Math.min(width, width)) continue;

    for (const [format, options] of [
      ["avif", { quality: 55 }],
      ["webp", { quality: 78 }],
    ]) {
      const out = `${base}${suffix}.${format}`;
      if (!(await isStale(file, out))) {
        skipped++;
        continue;
      }
      await sharp(file).resize({ width: target }).toFormat(format, options).toFile(out);
      converted++;
    }
  }
}

console.log(`Optimised ${converted} file(s), skipped ${skipped} up-to-date.`);
if (converted === 0 && skipped === 0) {
  console.log(
    `Nothing found in ${SRC}. Run scripts/fetch-assets.sh first — note that it ` +
      `requires network access to absourcebiologics.com.`
  );
}
