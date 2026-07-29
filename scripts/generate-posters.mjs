/**
 * Pre-render the hero culture field for tier 1 (Section 7A.3).
 *
 * Tier 1 devices — reduced motion, save-data, 2G/3G, no WebGL2 — never load the
 * simulation, so they need a still of the same field the GPU would have drawn.
 * This runs the identical Gray-Scott system on the CPU, seeded with the same
 * thirteen colonies, and writes it out as AVIF.
 *
 *   node scripts/generate-posters.mjs              # write the poster
 *   node scripts/generate-posters.mjs --explore    # parameter contact sheet
 *
 * `--explore` is why this exists in the form it does. Gray-Scott's behaviour is
 * extremely sensitive to feed/kill, and the difference between "thirteen inert
 * rings" and "colonies branching across a plate" is a third decimal place. Look
 * at the contact sheet rather than guessing; the values in CultureField.tsx
 * were chosen from it.
 *
 * The seed positions here MUST stay in step with seedFragmentShader in
 * src/components/webgl/shaders/grayScott.ts. If the two drift, the poster stops
 * matching what tier 2+ actually shows and the cross-dissolve visibly jumps.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

/** Thirteen seeds, one per DVS culture line. Mirrors the GLSL seed pass. */
const SEEDS = [
  [0.18, 0.72], [0.31, 0.41], [0.47, 0.79], [0.62, 0.33], [0.74, 0.62],
  [0.86, 0.28], [0.12, 0.24], [0.55, 0.57], [0.92, 0.71], [0.39, 0.17],
  [0.68, 0.88], [0.26, 0.92], [0.81, 0.48],
];

const DA = 1.0;
const DB = 0.5;
const DT = 1.0;

/** Brand palette, sRGB. ab-ghee never appears here (Section 16). */
const MILK = [0xfb, 0xfa, 0xf7];
const CHILL = [0xdc, 0xe7, 0xe7];
const TANK = [0x0b, 0x3b, 0x3c];

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function simulate({ size, steps, feed, kill }) {
  const n = size * size;
  let a = new Float32Array(n).fill(1);
  let b = new Float32Array(n);
  let a2 = new Float32Array(n);
  let b2 = new Float32Array(n);

  const seedRadius = 0.045 * size;
  for (const [sx, sy] of SEEDS) {
    const cx = sx * size;
    const cy = (1 - sy) * size;
    const r = Math.ceil(seedRadius);
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const px = Math.round(cx + x);
        const py = Math.round(cy + y);
        if (px < 0 || px >= size || py < 0 || py >= size) continue;
        const d = Math.hypot(x, y) / size;
        const v = smoothstep(0.045, 0.008, d);
        const i = py * size + px;
        b[i] = Math.min(1, b[i] + v);
      }
    }
  }

  // Wrapped neighbour offsets, matching the GPU pass's repeat sampling.
  const wrap = (v) => (v + size) % size;

  for (let step = 0; step < steps; step++) {
    for (let y = 0; y < size; y++) {
      const yUp = wrap(y - 1) * size;
      const yDn = wrap(y + 1) * size;
      const yMid = y * size;
      for (let x = 0; x < size; x++) {
        const xL = wrap(x - 1);
        const xR = wrap(x + 1);
        const i = yMid + x;

        const lapA =
          0.2 * (a[yMid + xL] + a[yMid + xR] + a[yUp + x] + a[yDn + x]) +
          0.05 * (a[yUp + xL] + a[yUp + xR] + a[yDn + xL] + a[yDn + xR]) -
          a[i];
        const lapB =
          0.2 * (b[yMid + xL] + b[yMid + xR] + b[yUp + x] + b[yDn + x]) +
          0.05 * (b[yUp + xL] + b[yUp + xR] + b[yDn + xL] + b[yDn + xR]) -
          b[i];

        const reaction = a[i] * b[i] * b[i];
        a2[i] = Math.min(1, Math.max(0, a[i] + (DA * lapA - reaction + feed * (1 - a[i])) * DT));
        b2[i] = Math.min(1, Math.max(0, b[i] + (DB * lapB + reaction - (kill + feed) * b[i]) * DT));
      }
    }
    [a, a2] = [a2, a];
    [b, b2] = [b2, b];
  }

  return b;
}

/** Display pass, mirroring displayFragmentShader. */
function colourise(field, size, ink) {
  const rgb = Buffer.alloc(size * size * 3);
  for (let i = 0; i < field.length; i++) {
    const v = field[i];
    const t1 = smoothstep(0.04, 0.18, v);
    const t2 = smoothstep(0.16, 0.42, v) * ink;
    const edge = smoothstep(0.2, 0.26, v) * (1 - smoothstep(0.3, 0.38, v)) * 0.14;
    for (let c = 0; c < 3; c++) {
      let value = MILK[c] + (CHILL[c] - MILK[c]) * t1;
      value = value + (TANK[c] - value) * t2;
      value = value + (MILK[c] - value) * edge;
      rgb[i * 3 + c] = Math.round(value);
    }
  }
  return rgb;
}

async function write(field, size, out, ink = 0.85) {
  const rgb = colourise(field, size, ink);
  await sharp(rgb, { raw: { width: size, height: size, channels: 3 } })
    .resize(1600, 900, { fit: "fill" })
    .toFile(out);
  console.log(`  wrote ${out}`);
}

const explore = process.argv.includes("--explore");

await mkdir("public/assets/webgl", { recursive: true });

if (explore) {
  await mkdir("/tmp/ab-gs", { recursive: true });
  const grid = [
    { feed: 0.037, kill: 0.06 },
    { feed: 0.042, kill: 0.059 },
    { feed: 0.046, kill: 0.062 },
    { feed: 0.055, kill: 0.062 },
    { feed: 0.058, kill: 0.065 },
    { feed: 0.03, kill: 0.057 },
  ];
  for (const { feed, kill } of grid) {
    for (const steps of [2000, 6000]) {
      const field = simulate({ size: 220, steps, feed, kill });
      await write(field, 220, `/tmp/ab-gs/f${feed}-k${kill}-s${steps}.png`);
    }
  }
  console.log("Contact sheet in /tmp/ab-gs — look at it before changing the shader.");
} else {
  // Keep in step with FEED_REST / KILL / INK_CEILING in CultureField.tsx.
  const FEED = Number(process.env.AB_FEED ?? 0.046);
  const KILL = Number(process.env.AB_KILL ?? 0.062);
  /**
   * 7000 steps is the state a visitor actually sees a few seconds after the
   * canvas mounts: colonies have merged into a network with a visible growth
   * front, and the plate is not yet fully colonised. Matching that matters —
   * the poster cross-dissolves into the live field, and a poster rendered at
   * the mature state (~16000 steps, a dense uniform labyrinth) makes the
   * dissolve read as a jump cut.
   */
  const STEPS = Number(process.env.AB_STEPS ?? 7000);

  console.log(`Simulating 512² for ${STEPS} steps (feed ${FEED}, kill ${KILL})…`);
  const field = simulate({ size: 512, steps: STEPS, feed: FEED, kill: KILL });
  await write(field, 512, "public/assets/webgl/culture-field-poster.avif");
}
