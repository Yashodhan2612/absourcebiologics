/**
 * Crop the department-head photographs to one consistent portrait size.
 *
 *   node scripts/prepare-team-portraits.mjs
 *
 * Sources live in public/assets/_source/team/ (gitignored); the AVIF and WebP
 * outputs in public/assets/team/ are what the repo carries.
 *
 * WHY 688x917, AND WHY ONE PORTRAIT IS INTERPOLATED.
 *
 * The brief requires every portrait to be the same size, which forces a single
 * output dimension, which forces a choice: downscale the good originals to
 * match the weakest, or interpolate the weakest up to match the rest.
 *
 * Six originals are 688px wide or more with height to spare. The seventh — the
 * Sales & Marketing portrait — is a 640x640 square, and the tallest 3:4 crop a
 * square yields is 480x640.
 *
 * The cards render the portrait at roughly 404 CSS px on a desktop grid, so
 * 480px is 1.19x and visibly soft on any retina screen, while 688px is 1.7x
 * and holds up. Capping everything at 480 would have made all seven soft to
 * protect one; going to 688 makes six genuinely sharp and interpolates one by
 * 1.43x. That one is the weakest source either way, so it is the right way
 * round. A higher-resolution original for that person removes the upscale with
 * no other change.
 *
 * `prepare-portraits.mjs` never upscales, and that rule still holds there: the
 * leadership page shows two portraits at their own native sizes because it has
 * no consistency requirement to satisfy. This one does.
 *
 * 3:4 because that is the site's portrait ratio already, on /about/leadership.
 *
 * LETTERBOXING. Three of the sources are phone screenshots with black bars
 * baked in. Those rows are detected and removed BEFORE the crop is measured,
 * because cropping "the top third" of a letterboxed image lands on the bar
 * rather than on the face.
 *
 * FOCUS. `focusY` is where the centre of the head sits, as a fraction of the
 * trimmed height. The crop places it at FACE_LINE from the top, which is the
 * standard portrait composition — head high, shoulders filling the base. These
 * were set by eye against the rendered output; re-check visually after
 * changing one, there is no face detection here.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/assets/_source/team";
const OUT = "public/assets/team";

/** Every portrait is written at exactly this size. */
const TARGET = { width: 688, height: 917 };

/** Where the head's centre sits inside the finished crop. */
const FACE_LINE = 0.4;

/** Rows darker than this (0–255 mean) are treated as letterbox. */
const BLACK = 24;

const PEOPLE = [
  { slug: "monika-satkar", file: "1.jpg", focusY: 0.25 },
  { slug: "shailesh-deshpande", file: "2.jpg", focusY: 0.46 },
  { slug: "archana-aitwade", file: "3.jpg", focusY: 0.33 },
  { slug: "rushant-shinde", file: "4.jpg", focusY: 0.35 },
  { slug: "prajkata-joshi", file: "5.jpg", focusY: 0.32 },
  { slug: "manisha-bhadekar", file: "6.jpg", focusY: 0.3 },
  { slug: "suraj-gurav", file: "7.jpg", focusY: 0.385 },
];

/** First and last rows that are not letterbox. */
async function contentRows(file) {
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const rowMean = (y) => {
    let sum = 0;
    for (let x = 0; x < width; x++) sum += data[y * width + x];
    return sum / width;
  };
  let top = 0;
  while (top < height - 1 && rowMean(top) < BLACK) top++;
  let bottom = height - 1;
  while (bottom > top && rowMean(bottom) < BLACK) bottom--;
  return { top, bottom, width, height };
}

await mkdir(OUT, { recursive: true });

const ratio = TARGET.width / TARGET.height;
let upscaled = 0;

for (const person of PEOPLE) {
  const file = `${SRC}/${person.file}`;
  const { top, bottom, width } = await contentRows(file);
  const contentHeight = bottom - top + 1;

  // The largest 3:4 box that fits inside the trimmed frame.
  let cropWidth = Math.min(width, Math.round(contentHeight * ratio));
  let cropHeight = Math.round(cropWidth / ratio);
  if (cropHeight > contentHeight) {
    cropHeight = contentHeight;
    cropWidth = Math.round(cropHeight * ratio);
  }

  // Put the head where FACE_LINE says, then clamp so the box stays inside.
  const focusAbsolute = top + person.focusY * contentHeight;
  let cropTop = Math.round(focusAbsolute - FACE_LINE * cropHeight);
  cropTop = Math.max(top, Math.min(cropTop, bottom - cropHeight + 1));
  const cropLeft = Math.round((width - cropWidth) / 2);

  const base = sharp(file).extract({
    left: cropLeft,
    top: cropTop,
    width: cropWidth,
    height: cropHeight,
  });

  const scale = TARGET.width / cropWidth;
  if (scale > 1) {
    // Expected for exactly one portrait; see the note at the top. Loud so a
    // new photograph that is too small does not slip in unnoticed.
    console.warn(`  ! ${person.slug}: interpolated ${scale.toFixed(2)}x from ${cropWidth}px wide`);
    upscaled++;
  }

  for (const [format, options] of [
    ["avif", { quality: 62 }],
    ["webp", { quality: 84 }],
  ]) {
    await base
      .clone()
      .resize(TARGET.width, TARGET.height, { fit: "cover" })
      .toFormat(format, options)
      .toFile(`${OUT}/${person.slug}.${format}`);
  }

  console.log(
    `  ${person.slug.padEnd(20)} crop ${cropWidth}x${cropHeight} @ y${cropTop}` +
      ` -> ${TARGET.width}x${TARGET.height} (${scale.toFixed(2)}x)`
  );
}

console.log(
  `\n${PEOPLE.length} portraits at ${TARGET.width}x${TARGET.height}` +
    (upscaled ? `, ${upscaled} UPSCALED` : ", none upscaled")
);
