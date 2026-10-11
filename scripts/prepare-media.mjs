/**
 * Build the plant photography, certificate scans and product photographs the
 * client supplied in October 2026.
 *
 *   node scripts/prepare-media.mjs
 *
 * Sources live in public/assets/_source/ (gitignored); the AVIF and WebP
 * outputs under public/assets/ are what the repo carries. Portraits are not
 * handled here — see prepare-team-portraits.mjs and prepare-portraits.mjs.
 *
 * WHY EVERY PLANT PHOTOGRAPH IS CROPPED HERE, NOT IN CSS.
 *
 * Each photograph is used in exactly one place on the site, and each place has
 * its own frame: 16:10 on /why-absource, 4:3 on the homepage, 16:9 on /quality.
 * The camera originals are 3:2 with the subject rarely in the middle — heads
 * sit in the top tenth of several of them — so letting `object-cover` centre
 * the crop cuts people off at the hairline. The crop is therefore chosen once,
 * here, per photograph, at the aspect of the frame it is shown in. `x` and `y`
 * say where the crop box sits in the leftover space: 0 is hard left or top, 1
 * hard right or bottom, 0.5 centred.
 *
 * ONE PHOTOGRAPH, ONE PLACE. The client's rule is that no photograph repeats
 * anywhere on the site. Do not point two entries at the same source, and do
 * not reference one output from two places; src/content/media.test.ts fails
 * if a photograph is referenced twice, or is committed and never used.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/assets/_source";
const OUT = "public/assets";

const FORMATS = [
  ["avif", { quality: 58 }],
  ["webp", { quality: 82 }],
];

async function write(pipeline, base, formats = FORMATS) {
  for (const [format, options] of formats) {
    await pipeline.clone().toFormat(format, options).toFile(`${base}.${format}`);
  }
}

/* ------------------------------------------------------------ the plant */

const FACILITY = [
  // Homepage, "we are manufacturers": fermentation, freeze-drying, packing.
  // The tall frame spans two 4:3 rows, so it is cut as a portrait.
  { out: "fermenter", file: "fermenter.jpg", aspect: 3 / 4, x: 0.72, y: 0.5, width: 1200 },
  { out: "freeze-dryer-room", file: "freeze-dryer-room.jpg", aspect: 4 / 3, x: 1, y: 0.5 },
  { out: "sachet-sealing", file: "sachet-sealing.jpg", aspect: 4 / 3, x: 1, y: 0 },
  // /why-absource, one per differentiator.
  { out: "clean-corridor", file: "clean-corridor.jpg", aspect: 16 / 10, x: 0.5, y: 0.5 },
  { out: "microscope-bench", file: "microscope-bench.jpg", aspect: 16 / 10, x: 0.5, y: 0.1 },
  { out: "packing-line", file: "packing-line.jpg", aspect: 16 / 10, x: 0.5, y: 0 },
  { out: "team-meeting", file: "team-meeting.jpg", aspect: 16 / 10, x: 0.5, y: 0.8 },
  { out: "sample-bench", file: "sample-bench.jpg", aspect: 16 / 10, x: 0.5, y: 0 },
  // /about.
  { out: "dispatch-corridor", file: "dispatch-corridor.jpg", aspect: 4 / 3, x: 0, y: 0.5 },
  // /quality, the phage block.
  { out: "microscopy-check", file: "microscopy-check.jpg", aspect: 16 / 9, x: 0.5, y: 0.15 },
];

async function facility() {
  await mkdir(`${OUT}/facility`, { recursive: true });
  for (const photo of FACILITY) {
    const file = `${SRC}/facility/2026/${photo.file}`;
    // .rotate() with no argument applies the camera's EXIF orientation.
    const upright = sharp(await sharp(file).rotate().toBuffer());
    const { width, height } = await upright.metadata();

    let cropWidth = width;
    let cropHeight = Math.round(width / photo.aspect);
    if (cropHeight > height) {
      cropHeight = height;
      cropWidth = Math.round(height * photo.aspect);
    }
    const left = Math.round((width - cropWidth) * photo.x);
    const top = Math.round((height - cropHeight) * photo.y);
    const target = photo.width ?? 1600;

    await write(
      upright
        .extract({ left, top, width: cropWidth, height: cropHeight })
        .resize({ width: target, withoutEnlargement: true }),
      `${OUT}/facility/${photo.out}`
    );
    console.log(
      `  facility/${photo.out.padEnd(20)} ${cropWidth}x${cropHeight} @ ${left},${top} -> ${target}w`
    );
  }
}

/* --------------------------------------------------------- certificates */

/**
 * The four certificate scans, as issued in July 2026.
 *
 * 1000px wide: they are shown small in a grid but open full size, and at full
 * size the certificate number and expiry date have to be legible — that is
 * what an auditor opens one to read. Quality is high for the same reason;
 * text on a scan is where compression artefacts show first.
 */
const CERTS = ["iso-9001", "iso-22000", "haccp", "halal"];

async function certs() {
  await mkdir(`${OUT}/certs`, { recursive: true });
  for (const slug of CERTS) {
    const source = sharp(`${SRC}/certs/${slug}.jpeg`).rotate();
    await write(source.resize({ width: 1000, withoutEnlargement: true }), `${OUT}/certs/${slug}`, [
      ["avif", { quality: 62 }],
      ["webp", { quality: 88 }],
    ]);
    const { width, height } = await sharp(`${OUT}/certs/${slug}.webp`).metadata();
    console.log(`  certs/${slug.padEnd(23)} ${width}x${height}`);
  }
}

/* -------------------------------------------------------------- products */

/**
 * `enlarge` is a plain Lanczos resample with a light unsharp mask. It is used
 * where the supplied file is smaller than the frame it is shown in on a
 * high-density screen, so the browser would otherwise do the same enlargement
 * with a worse filter. It adds no detail and invents nothing: lettering that
 * is illegible in the source stays illegible. A generative upscaler was
 * deliberately NOT used — on pack artwork it rewrites small print into
 * plausible nonsense, and this is a label.
 */
const PRODUCTS = [
  {
    // FERMENTA's printed sachet. Cropped to the sachet, losing most of the
    // grey table it was photographed on.
    out: "products/cultures/fermenta",
    file: "fermenta-sachet.jpg",
    crop: { left: 24, top: 48, width: 648, height: 1016 },
    enlarge: 1.7,
  },
  {
    // The ABRenno bottle: a wide canvas that is mostly white. Trimmed to the
    // bottle so it fills the pack well instead of sitting small in the middle.
    out: "products/ingredients/abrenno",
    file: "abrenno-bottle.jpg",
    trim: true,
    pad: 24,
    enlarge: 1.5,
  },
  { out: "products/ingredients/abmerge-25kg", file: "abmerge-25kg.jpg", trim: true, pad: 32 },
  { out: "products/taste-makers/abspice-25kg", file: "abspice-25kg.jpg", trim: true, pad: 32 },
];

async function products() {
  for (const item of PRODUCTS) {
    let image = sharp(`${SRC}/products/2026/${item.file}`).rotate();
    if (item.crop) image = image.extract(item.crop);
    if (item.trim) {
      // Trim the white surround, then put an even margin back.
      const trimmed = await image.trim({ background: "#ffffff", threshold: 12 }).toBuffer();
      image = sharp(trimmed).extend({
        top: item.pad,
        bottom: item.pad,
        left: item.pad,
        right: item.pad,
        background: "#ffffff",
      });
    }
    const flat = sharp(await image.toBuffer());
    const { width } = await flat.metadata();

    let pipeline = flat;
    if (item.enlarge) {
      pipeline = flat
        .resize({ width: Math.round(width * item.enlarge), kernel: "lanczos3" })
        .sharpen({ sigma: 0.9, m1: 0.5, m2: 1.4 });
    }
    await write(pipeline, `${OUT}/${item.out}`, [
      ["avif", { quality: 62 }],
      ["webp", { quality: 86 }],
    ]);
    const meta = await sharp(`${OUT}/${item.out}.webp`).metadata();
    console.log(
      `  ${item.out.padEnd(38)} ${meta.width}x${meta.height}` +
        (item.enlarge ? `  (resampled ${item.enlarge}x from ${width}px wide)` : "")
    );
  }
}

console.log("Plant photography");
await facility();
console.log("\nCertificates");
await certs();
console.log("\nProducts");
await products();
