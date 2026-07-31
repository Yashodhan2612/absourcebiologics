/**
 * Layout for the hero's Streptococcus chains.
 *
 * WHY THIS REPLACED THE REACTION-DIFFUSION FIELD
 * The hero previously ran a Gray-Scott simulation. It is beautiful maths and
 * it is genuinely what colonies spreading on an agar plate look like — but
 * Gray-Scott's signature is *mycelial branching*, and ABsource's own people
 * read it as a fungus. A dairy starter culture company cannot have a
 * background that a microbiologist reads as mould. Streptococcus thermophilus
 * is one of the two organisms in almost every dahi and yoghurt starter
 * ABsource makes, and it grows in chains of ovoid cocci. That is the correct
 * morphology, it is unambiguous to a technical buyer, and it is what the
 * client asked for.
 *
 * ONE SOURCE OF TRUTH. This module is imported by both the WebGL component and
 * scripts/generate-posters.mjs (Node 24 strips the types on import). The
 * shader and the tier-1 poster therefore lay out identical chains from the
 * same seed. Do not duplicate this logic into either consumer.
 *
 * WORLD SPACE. The camera is orthographic with half-height fixed at 1, so the
 * visible region is x in [-aspect, aspect], y in [-1, 1]. Fixing the vertical
 * extent is what makes this work on a phone without a separate mobile design:
 * vertical composition is identical at every viewport, and only the horizontal
 * span changes. Cell sizes are therefore a constant fraction of viewport
 * height on every device.
 */

/** Deterministic small PRNG, so a given seed always lays out the same field. */
function rng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type StrepInstance = {
  /** Chain origin in world space. */
  readonly ox: number;
  readonly oy: number;
  /** Unit direction along the chain. Always points right, so chains grow and
   *  drift left to right — the reading direction, and the client's brief. */
  readonly dx: number;
  readonly dy: number;
  /** Distance of this cell from the chain origin, and the chain's total length.
   *  Cells wrap within [0, chainLen) so the chain is effectively endless: as a
   *  cell leaves the right it reappears at the left with spacing preserved.
   *  The wrap point sits off-screen, so the seam is never visible. */
  readonly along: number;
  readonly chainLen: number;
  /** Drift along the chain, world units per second. */
  readonly speed: number;
  /** Seconds before this cell begins to appear. */
  readonly delay: number;
  /** Ellipse radii: rx along the chain, ry across it. Cocci are slightly
   *  ovoid with the long axis following the chain. */
  readonly rx: number;
  readonly ry: number;
  /** 0 = in focus, 1 = fully out of focus. Drives both edge softness and
   *  how much of the sphere modelling survives. */
  readonly blur: number;
  readonly alpha: number;
  /** Base colour, sRGB 0-1. Consumers convert as their pipeline requires. */
  readonly color: readonly [number, number, number];
  /** Gentle undulation across the chain axis, so it reads as suspended in
   *  liquid rather than printed on the page. */
  readonly waveAmp: number;
  readonly waveFreq: number;
  readonly wavePhase: number;
  /** Static bend of the chain itself. Without this every chain is a ruled
   *  line and the field reads as beaded jewellery rather than as an organism —
   *  which is exactly what the first revision looked like. Real streptococci
   *  meander. */
  readonly curveAmp: number;
  readonly curveFreq: number;
  readonly curvePhase: number;
};

export type StrepField = {
  readonly instances: readonly StrepInstance[];
  /** Seconds the left-to-right formation sweep takes to cross the viewport. */
  readonly sweepDuration: number;
  /** Seconds an individual cell takes to pop in. */
  readonly growDuration: number;
};

/**
 * Stain palette, sRGB 0-1.
 *
 * Taken from the client's reference image: a Gram-stained / false-colour SEM
 * magenta. This is deliberately outside the site palette — ab-tank, ab-chill,
 * ab-milk — and it is the one place on the site that is. It reads as a stain,
 * which is what it is, and the hero scrim keeps it away from the headline so
 * body contrast is unaffected.
 */
const CELL_COLORS: ReadonlyArray<readonly [number, number, number]> = [
  [0.76, 0.10, 0.47], // core magenta
  [0.84, 0.20, 0.53],
  [0.66, 0.07, 0.40],
  [0.88, 0.31, 0.60],
  [0.71, 0.13, 0.51],
];

/**
 * Out-of-focus background blobs.
 *
 * Kept cool — violet, indigo, and the brand's own ab-tank — rather than
 * following the reference image's greens. Magenta plus green plus blue on a
 * warm-white page turns into a rainbow and stops looking like microscopy.
 */
const BOKEH_COLORS: ReadonlyArray<readonly [number, number, number]> = [
  [0.48, 0.29, 0.62], // violet
  [0.23, 0.25, 0.56], // indigo
  [0.04, 0.23, 0.24], // ab-tank
  [0.60, 0.24, 0.52], // dusty magenta
];

const SWEEP_DURATION = 1.9;
const GROW_DURATION = 0.55;

/**
 * Thirteen chains at full tier — one per DVS culture line, the same motif the
 * StrainIndex rail carries. Not decorative trivia; keep it at thirteen.
 */
const CHAINS_FULL = 13;
const CHAINS_REDUCED = 7;

export function buildStrepField({
  aspect,
  tier,
  seed = "absource-streptococcus",
}: {
  aspect: number;
  tier: 2 | 3;
  seed?: string;
}): StrepField {
  const next = rng(seed);
  const instances: StrepInstance[] = [];

  const chainCount = tier >= 3 ? CHAINS_FULL : CHAINS_REDUCED;
  const bokehCount = tier >= 3 ? 14 : 6;

  // --- Out-of-focus ground first, so it sits behind everything ------------
  for (let i = 0; i < bokehCount; i++) {
    const radius = 0.26 + next() * 0.34;
    instances.push({
      ox: (next() * 2 - 1) * (aspect + 0.3),
      oy: (next() * 2 - 1) * 1.15,
      dx: 1,
      dy: 0,
      along: 0,
      chainLen: 1e6, // never wraps
      speed: 0.004 + next() * 0.01,
      delay: next() * 0.5,
      rx: radius,
      ry: radius * (0.85 + next() * 0.3),
      blur: 1,
      alpha: 0.12 + next() * 0.12,
      color: BOKEH_COLORS[Math.floor(next() * BOKEH_COLORS.length)]!,
      waveAmp: 0.02,
      waveFreq: 0.6,
      wavePhase: next() * 6.28,
      curveAmp: 0,
      curveFreq: 0,
      curvePhase: 0,
    });
  }

  // --- The chains ----------------------------------------------------------
  for (let c = 0; c < chainCount; c++) {
    // Depth band. Only a couple of chains are in focus; the rest fall away
    // fast. This is a BACKGROUND, and the balance matters more than it would
    // in a poster — a full-strength slide of chains behind a headline is a
    // wall of magenta that competes with the copy instead of supporting it.
    // One or two sharp chains carry the read; everything else is atmosphere.
    // Deterministic band assignment rather than a random draw. With thirteen
    // chains and a random depth, a run can easily put every on-screen chain in
    // the blurred bands and leave the hero with no sharp chain at all — which
    // is exactly what happened when this was random.
    // Three bands, not four: the scrim already hides the left half of the
    // field, so the chains effectively only live in the right 45% of the
    // frame. Spending a whole band on near-invisible chains left the hero
    // with nothing in focus anywhere. The bokeh layer is the far distance.
    const band = c % 3;
    const blur = band === 0 ? 0.03 : band === 1 ? 0.34 : 0.72;
    const alpha = band === 0 ? 1 : band === 1 ? 0.78 : 0.5;

    // Shallow. At +-0.5 rad a chain climbs more than two world units across
    // its run, so it enters and leaves the frame within a fraction of the
    // width and the visible band ends up mostly empty — which is what the
    // hero looked like before this was tightened. Around +-16 degrees keeps
    // every chain crossing the full width.
    const angle = (next() * 2 - 1) * 0.15;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    // Long enough to overhang both edges, so the wrap seam is never on screen.
    const chainLen = (2 * aspect + 1.4) / dx;

    // Centre the chain on the frame, then offset vertically into its band.
    // Thirteen chains spread well beyond the frame, so roughly five or six
    // are visible at any viewport. At the cell sizes below, putting all
    // thirteen on screen would be a solid mat of magenta.
    // Spread past the frame so roughly six of the thirteen are on screen at
    // once. All thirteen visible is a solid mat of magenta.
    const chainY = (c / Math.max(1, chainCount - 1)) * 3.4 - 1.7 + (next() - 0.5) * 0.26;
    const ox = -(dx * chainLen) / 2;
    const oy = chainY - (dy * chainLen) / 2;

    // Cell size is the single most important number here. At the 0.05 the
    // first revision used, a desktop frame held forty-plus cells per chain and
    // the result read as a beaded necklace. Around 0.10 gives eight to sixteen
    // across the frame, which is what the client's reference slide looks like.
    // Roughly 3.5% to 5% of viewport height per cell on a desktop frame.
    //
    // Scaled down on narrow viewports. Radii are in half-height units, which
    // is what keeps the vertical composition identical everywhere — but a
    // phone is only about 0.9 world units WIDE, so an unscaled cell is a fifth
    // of the screen across and the chain reads as four beads rather than as a
    // filament. This brings a portrait viewport back to roughly a dozen cells
    // across, which is what the client's reference slide shows.
    const widthScale = Math.min(1, 0.55 + aspect * 0.25);
    const rx = (0.07 + next() * 0.032) * widthScale;
    // Cocci are ovoid, not spherical, with the long axis following the chain.
    // At the 0.85 ratio the first revision used they read as ball bearings.
    const ry = rx * (0.62 + next() * 0.08);
    // Cells touch and overlap, which is what makes a chain read as one
    // organism rather than as beads on a string.
    const spacing = rx * 1.3;
    const cellCount = Math.max(4, Math.floor(chainLen / spacing));

    // Chains bend, but gently. Angle and curve together decide how far a chain
    // wanders out of its band across the frame; too much of either and the
    // in-focus chains climb off-screen and the visible band is left with only
    // the blurred ones.
    const curveAmp = 0.06 + next() * 0.14;
    const curveFreq = 0.5 + next() * 0.85;
    const curvePhase = next() * 6.28;

    const speed = 0.05 + next() * 0.045;
    const waveAmp = 0.012 + next() * 0.02;
    const waveFreq = 1.4 + next() * 1.6;
    const wavePhase = next() * 6.28;
    // A little per-chain jitter so the sweep is not mechanically uniform.
    const chainDelay = next() * 0.35;

    for (let i = 0; i < cellCount; i++) {
      const along = i * spacing;
      const x0 = ox + dx * along;

      // Formation order is by SCREEN position, not by index along the chain.
      // Ordering by index would spend the first half-second forming cells that
      // are off-screen to the left, and the sweep would appear to start late
      // and from nowhere. This makes it start exactly at the left edge.
      const screenT = (x0 + aspect) / (2 * aspect);
      const delay = chainDelay + Math.max(0, Math.min(1.15, screenT)) * SWEEP_DURATION;

      // Cells in a real chain are not identical. A little size jitter is what
      // stops the eye reading the chain as a manufactured object.
      const jitter = 0.88 + next() * 0.24;
      // Out-of-focus cells grow. A real blur circle spreads, so neighbours in
      // a defocused chain merge into a continuous soft tube. Without this the
      // back chains stay separated and read as a dotted line, which is what
      // they did before.
      const spread = 1 + blur * 0.42;

      instances.push({
        ox,
        oy,
        dx,
        dy,
        along,
        chainLen,
        speed,
        delay,
        rx: rx * jitter * spread,
        ry: ry * jitter * spread,
        blur,
        alpha,
        color: CELL_COLORS[Math.floor(next() * CELL_COLORS.length)]!,
        waveAmp,
        waveFreq,
        wavePhase,
        curveAmp,
        curveFreq,
        curvePhase,
      });
    }
  }

  // Painter's order. Depth testing is off — these are translucent — so the
  // draw order IS the depth order. Blurred first, sharp last.
  instances.sort((a, b) => b.blur - a.blur);

  return { instances, sweepDuration: SWEEP_DURATION, growDuration: GROW_DURATION };
}

/**
 * Shadowed core, sRGB 0-1. Used both for the unlit side and — importantly —
 * for the silhouette. Stained cocci are DARKEST at the edge, where you are
 * looking through the most cell wall. The first revision brightened the rim
 * towards white instead, which put a halo around every cell and was most of
 * why they read as plastic beads.
 */
export const CELL_DEEP: readonly [number, number, number] = [0.22, 0.02, 0.14];
/** Colour of the sheen. Broad and soft, not a tight plastic highlight. */
export const CELL_RIM: readonly [number, number, number] = [1.0, 0.88, 0.95];
