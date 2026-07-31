/**
 * Pre-render the hero's Streptococcus field for tier 1.
 *
 * Tier 1 devices — reduced motion, save-data, 2G/3G, no WebGL2 — never load
 * the canvas, so they need a still of the same field. This imports the exact
 * layout module the shader uses (Node 24 strips the types on import) and
 * rasterises it with the same lighting maths, so the two cannot drift apart.
 *
 *   node scripts/generate-posters.mjs
 *
 * Requires Node 22.6+ for native TypeScript import. On older Node this fails
 * with ERR_UNKNOWN_FILE_EXTENSION; upgrade rather than duplicating the layout.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import {
  buildStrepField,
  CELL_DEEP,
  CELL_RIM,
} from "../src/components/webgl/strepLayout.ts";

const WIDTH = 1600;
const HEIGHT = 900;
/** Page background, ab-milk, sRGB 0-255. */
const MILK = [0xfb, 0xfa, 0xf7];

const aspect = WIDTH / HEIGHT;
/** World half-height is 1 by convention, so this is the world-to-pixel scale. */
const SCALE = HEIGHT / 2;

const { instances } = buildStrepField({ aspect, tier: 3 });

// Float accumulation buffer, so hundreds of overlapping translucent cells
// composite without the rounding drift an 8-bit buffer would accumulate.
const buffer = new Float32Array(WIDTH * HEIGHT * 3);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  buffer[i * 3] = MILK[0] / 255;
  buffer[i * 3 + 1] = MILK[1] / 255;
  buffer[i * 3 + 2] = MILK[2] / 255;
}

const L = (() => {
  const v = [-0.42, 0.58, 0.7];
  const len = Math.hypot(...v);
  return v.map((n) => n / len);
})();
const H = (() => {
  const v = [L[0], L[1], L[2] + 1];
  const len = Math.hypot(...v);
  return v.map((n) => n / len);
})();

const mix = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Mirrors strepFragmentShader. Keep the two in step. */
function shade(qx, qy, color, blur) {
  const r = Math.hypot(qx, qy);
  if (r > 1) return null;

  const z = Math.sqrt(Math.max(0, 1 - r * r));
  const inv = 1 / Math.hypot(qx, qy, z);
  const n = [qx * inv, qy * inv, z * inv];

  const diff = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
  const edgeDepth = Math.pow(1 - z, 1.9);
  const spec = Math.pow(Math.max(0, n[0] * H[0] + n[1] * H[1] + n[2] * H[2]), 11);

  const out = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    let v = mix(CELL_DEEP[c], color[c], Math.pow(diff, 0.8));
    v = mix(v, CELL_DEEP[c], edgeDepth * 0.5);
    v += CELL_RIM[c] * spec * 0.42;
    v = mix(v, color[c], blur * 0.88);
    out[c] = v;
  }

  const edge = mix(0.07, 0.92, blur);
  const alpha = 1 - smoothstep(1 - edge, 1, r);
  return { color: out, alpha };
}

/**
 * Positions are taken at t = 0 with growth complete. The poster is the settled
 * state of the field, which is what a tier-1 reader should see — they get no
 * formation animation, so showing a half-built chain would just look broken.
 */
for (const it of instances) {
  const nrm = [-it.dy, it.dx];

  // Mirrors strepVertexShader: the chain's static bend plus the sway at t = 0.
  const bend = Math.sin(it.along * it.curveFreq + it.curvePhase) * it.curveAmp;
  const sway = Math.sin(it.along * it.waveFreq + it.wavePhase) * it.waveAmp;
  const off = bend + sway;

  const wx = it.ox + it.dx * it.along + nrm[0] * off;
  const wy = it.oy + it.dy * it.along + nrm[1] * off;

  const cx = (wx / aspect) * (WIDTH / 2) + WIDTH / 2;
  const cy = HEIGHT / 2 - wy * SCALE;
  const rx = it.rx * SCALE;
  const ry = it.ry * SCALE;

  // Orient to the tangent of the curved path, as the shader does.
  const slope = Math.cos(it.along * it.curveFreq + it.curvePhase) * it.curveAmp * it.curveFreq;
  const tlen = Math.hypot(it.dx + nrm[0] * slope, it.dy + nrm[1] * slope) || 1;
  const ca = (it.dx + nrm[0] * slope) / tlen;
  const sa = (it.dy + nrm[1] * slope) / tlen;
  const reach = Math.ceil(Math.max(rx, ry)) + 2;

  const x0 = Math.max(0, Math.floor(cx - reach));
  const x1 = Math.min(WIDTH - 1, Math.ceil(cx + reach));
  const y0 = Math.max(0, Math.floor(cy - reach));
  const y1 = Math.min(HEIGHT - 1, Math.ceil(cy + reach));

  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const dx = px + 0.5 - cx;
      // Screen y grows downward; world y grows upward.
      const dy = -(py + 0.5 - cy);
      const qx = (dx * ca + dy * sa) / rx;
      const qy = (-dx * sa + dy * ca) / ry;

      const sample = shade(qx, qy, it.color, it.blur);
      if (!sample) continue;

      const a = sample.alpha * it.alpha;
      if (a <= 0.002) continue;

      const i = (py * WIDTH + px) * 3;
      for (let c = 0; c < 3; c++) {
        buffer[i + c] = mix(buffer[i + c], sample.color[c], a);
      }
    }
  }
}

const rgb = Buffer.alloc(WIDTH * HEIGHT * 3);
for (let i = 0; i < buffer.length; i++) {
  rgb[i] = Math.round(Math.min(1, Math.max(0, buffer[i])) * 255);
}

await mkdir("public/assets/webgl", { recursive: true });
await sharp(rgb, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
  .avif({ quality: 62 })
  .toFile("public/assets/webgl/culture-field-poster.avif");

console.log(
  `Rasterised ${instances.length} cells -> public/assets/webgl/culture-field-poster.avif`
);
