/**
 * Build the two leadership portraits.
 *
 *   node scripts/prepare-portraits.mjs
 *
 * These are handled separately from scripts/fetch-assets.sh because they need
 * cropping, and the crop is the whole point.
 *
 * THE PROBLEM THIS SOLVES. Both source photographs are 3:2 landscape. The
 * leadership page shows portraits. Rendering a landscape source into a portrait
 * box with `object-cover` makes the browser scale the image until its HEIGHT
 * fills the box and then throw away most of the width — so a 320px-wide box
 * renders the image about 600px wide internally. `sizes` only knows the CSS box
 * width, so Next served a ~384px-wide file for a ~600px render and the browser
 * upscaled the difference. That is where the softness came from, and no amount
 * of re-encoding fixes it.
 *
 * So the crop happens here, once, at full source resolution: each portrait is
 * cut to the 3:4 the page actually displays. The rendered size then equals the
 * CSS box, `sizes` becomes truthful, and nothing is ever scaled up.
 *
 * Output is written at the crop's native pixel size and is NEVER resized up.
 * If you change the display box in the leadership page, re-check the numbers
 * the script prints at the end rather than assuming they still hold.
 */
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { Buffer } from "node:buffer";

const OUT = "public/assets/team";
const SRC = "public/assets/_source/team";

/**
 * Crop rectangles, in source pixels. Chosen by eye against the originals and
 * checked at full size — see the commit that introduced this file.
 */
const PORTRAITS = [
  {
    slug: "mukesh-vinze",
    /**
     * Dr Vinze's portrait, supplied by the client in October 2026. It replaces
     * the phone photograph taken at AgriTech / DairyTech India 2022, which was
     * the only solo picture of him available at the time.
     *
     * A local file with no URL: it was sent directly rather than uploaded to
     * the live site, so there is nothing to download.
     *
     * The source is a 1316x1195 landscape frame with him right of centre. The
     * crop is the full height, 3:4, centred on him — the loosest framing the
     * photograph allows, because Mr Sonavane beside him is photographed from
     * further back and a tighter crop made the pair look mismatched.
     */
    file: "2026/mukesh-vinze.webp",
    crop: { left: 167, top: 0, width: 896, height: 1195 },
  },
  {
    slug: "jagannath-sonavane",
    /**
     * Mr Sonavane at his desk — the same photograph as before, but taken from
     * the 2048px re-upload rather than the 1536px copy the fetch script pulls.
     * Cropping to 3:4 from the larger original is what lets the page show him
     * smaller AND sharper at the same time.
     */
    url: "https://absourcebiologics.com/wp-content/uploads/2026/06/J-Sonawane-Sirs-photo.jpg",
    file: "J-Sonawane-Sirs-photo.jpg",
    crop: { left: 655, top: 0, width: 1024, height: 1366 },
  },
];

/** The CSS box the leadership page renders these in. Keep in step with it. */
const DISPLAY = { width: 320, height: 427 };

await mkdir(OUT, { recursive: true });
await mkdir(SRC, { recursive: true });

for (const p of PORTRAITS) {
  // A source already on disk is used as it is. Only a portrait that has a URL
  // and no local copy is downloaded, so re-running this needs no network.
  const local = `${SRC}/${p.file}`;
  let buffer;
  if (existsSync(local)) {
    buffer = await readFile(local);
  } else if (p.url) {
    const response = await fetch(p.url);
    if (!response.ok) {
      console.error(`  FAILED ${p.slug}: HTTP ${response.status} for ${p.url}`);
      process.exitCode = 1;
      continue;
    }
    buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(local, buffer);
  } else {
    console.error(`  FAILED ${p.slug}: ${local} is missing and there is no URL to fetch it from`);
    process.exitCode = 1;
    continue;
  }

  const cropped = sharp(buffer).extract(p.crop);
  // Quality is above the site default deliberately: these are the only faces
  // on the site, and WebP artefacts around eyes and collars are obvious.
  await cropped.clone().webp({ quality: 88 }).toFile(`${OUT}/${p.slug}.webp`);
  await cropped.clone().avif({ quality: 68 }).toFile(`${OUT}/${p.slug}.avif`);

  const { width, height } = p.crop;
  const headroom = Math.min(width / DISPLAY.width, height / DISPLAY.height);
  console.log(
    `  ${p.slug}: ${width}x${height} — ${headroom.toFixed(2)}x the ${DISPLAY.width}x${DISPLAY.height} box ` +
      `(supports DPR ${Math.floor(headroom * 100) / 100} without upscaling)`
  );
  if (headroom < 2) {
    console.warn(`  WARNING: ${p.slug} cannot serve a 2x display without upscaling.`);
  }
}
