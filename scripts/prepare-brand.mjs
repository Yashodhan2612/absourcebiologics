/**
 * Build the ABsource logo assets.
 *
 *   node scripts/prepare-brand.mjs
 *
 * Handled here rather than by fetch-assets.sh + optimise-assets.mjs for two
 * reasons, both of which matter for a logo specifically:
 *
 * 1. LOSSLESS. optimise-assets encodes at WebP q78 / AVIF q55, which is right
 *    for photographs and wrong for flat-colour vector art — lossy compression
 *    puts ringing along every letter edge and around the mark's red arcs, and
 *    it is most visible at exactly the small sizes a navbar uses. These are
 *    encoded lossless instead. The file is a few tens of KB either way.
 *
 * 2. TRIMMING. The source PNG carries transparent padding. Left in, it eats
 *    part of the height budget in the navbar and makes the artwork render
 *    smaller than the box suggests. Trimming lets the logo fill its box.
 *
 * The 601x206 source is the largest the live site holds — `full` size in the
 * media library, with no unscaled original behind it. Trimmed it is 550x179,
 * which at the navbar sizes below still leaves headroom past a 3x display.
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";

const OUT = "public/assets/brand";
const SRC = "public/assets/_source/brand";
const URL = "https://absourcebiologics.com/wp-content/uploads/2020/12/Artboard-1.png";

/** Largest height the logo is rendered at, in CSS pixels. Keep in step with Logo.tsx. */
const MAX_DISPLAY_HEIGHT = 44;

await mkdir(OUT, { recursive: true });
await mkdir(SRC, { recursive: true });

const response = await fetch(URL);
if (!response.ok) {
  console.error(`FAILED: HTTP ${response.status} for ${URL}`);
  process.exit(1);
}
const original = Buffer.from(await response.arrayBuffer());
await writeFile(`${SRC}/Artboard-1.png`, original);

const trimmed = await sharp(original).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
const { width, height } = trimmed.info;

await sharp(trimmed.data).webp({ lossless: true }).toFile(`${OUT}/logo.webp`);
await sharp(trimmed.data).avif({ lossless: true }).toFile(`${OUT}/logo.avif`);

/**
 * Reversed lockup for the footer, which sits on ab-tank.
 *
 * The logo's own colours are a dark blue wordmark with a black "BIOLOGICS"
 * line — on a dark teal ground the wordmark all but disappears. So this keeps
 * the artwork's alpha shape and paints every opaque pixel ab-milk, which is
 * the standard knockout treatment. The three-lobe mark still separates
 * correctly because its lobes are divided by transparent gaps rather than by
 * colour.
 */
const alpha = await sharp(trimmed.data).ensureAlpha().extractChannel("alpha").toBuffer();
const reversed = await sharp({
  create: { width, height, channels: 3, background: "#fbfaf7" },
})
  .joinChannel(alpha)
  .png()
  .toBuffer();

await sharp(reversed).webp({ lossless: true }).toFile(`${OUT}/logo-reversed.webp`);
await sharp(reversed).avif({ lossless: true }).toFile(`${OUT}/logo-reversed.avif`);

const displayWidth = Math.round((width / height) * MAX_DISPLAY_HEIGHT);
console.log(
  `  logo: ${width}x${height} (trimmed from 601x206), aspect ${(width / height).toFixed(3)}\n` +
    `  renders at ${displayWidth}x${MAX_DISPLAY_HEIGHT} css — ` +
    `${(width / displayWidth).toFixed(2)}x headroom, ` +
    `clean to DPR ${Math.floor((width / displayWidth) * 100) / 100}`
);
