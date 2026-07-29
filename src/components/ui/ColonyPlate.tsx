import { cn } from "@/lib/cn";

/**
 * Deterministic agar-plate colony morphology, generated as SVG.
 *
 * Section 5 permits abstract science texture — agar-plate colony morphology,
 * phase-contrast microscopy of lactic acid bacteria — generated as SVG so it
 * stays crisp and tiny, and explicitly rules out AI photo-realistic imagery of
 * laboratories, which reads as fake to a technical buyer.
 *
 * This stands in for application photography that could not be sourced in this
 * environment (see CONTENT-TODO.md). It is deliberately NOT a photo and does
 * not pretend to be one: it is a diagrammatic colony field in the brand
 * palette, which is at least a picture of the actual thing ABsource makes.
 *
 * Fully deterministic from `seed`, so a given product or solution always draws
 * the same plate — no hydration mismatch, no layout shift, no randomness
 * between server and client.
 *
 * Palette is restricted to ab-milk / ab-chill / ab-tank. ab-ghee never appears
 * here, matching the rule that governs the WebGL layer.
 */

/** xmushash-style string hash → 32-bit seed. */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, deterministic. */
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Colony = {
  cx: number;
  cy: number;
  r: number;
  ring: boolean;
  opacity: number;
};

function generateColonies(seed: string, count: number): Colony[] {
  const next = rng(hashSeed(seed));
  const colonies: Colony[] = [];

  /**
   * Per-seed morphology. Without this every plate looks the same, and a grid
   * of eight identical-looking cards is worse than no imagery at all. Real
   * plates differ by organism: some throw a few large spreading colonies,
   * others a dense lawn of fine pinpoints. `coarseness` picks a point on that
   * range and drives size, count and clustering together, so plates read as
   * genuinely distinct rather than as the same texture reshuffled.
   */
  const coarseness = next(); // 0 = fine dense lawn, 1 = few large colonies
  const minR = 0.5 + coarseness * 2.2;
  const maxR = minR + 1.2 + coarseness * 5.5;
  const effectiveCount = Math.round(count * (1.35 - coarseness * 0.85));
  const clusterCount = 2 + Math.floor(next() * 4);
  const spreadBase = 10 + coarseness * 26;

  const clusters = Array.from({ length: clusterCount }, () => ({
    x: 8 + next() * 84,
    y: 8 + next() * 84,
  }));

  for (let i = 0; i < effectiveCount; i++) {
    const cluster = clusters[Math.floor(next() * clusters.length)];
    if (!cluster) continue;
    const spread = spreadBase + next() * 18;
    const angle = next() * Math.PI * 2;
    // sqrt keeps density higher toward the cluster centre.
    const dist = Math.sqrt(next()) * spread;
    const r = minR + next() * (maxR - minR);
    colonies.push({
      cx: Math.max(2, Math.min(98, cluster.x + Math.cos(angle) * dist)),
      cy: Math.max(2, Math.min(98, cluster.y + Math.sin(angle) * dist)),
      r,
      // Larger colonies develop a visible margin.
      ring: r > minR + (maxR - minR) * 0.55 && next() > 0.4,
      opacity: 0.14 + next() * (0.3 + coarseness * 0.34),
    });
  }
  return colonies;
}

export function ColonyPlate({
  seed,
  className,
  density = 90,
  label,
}: {
  seed: string;
  className?: string;
  density?: number;
  /** Supply when the plate carries meaning; omit for pure decoration. */
  label?: string;
}) {
  const colonies = generateColonies(seed, density);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width="100" height="100" fill="var(--color-ab-chill)" />
      {/* Diffuse growth haze under the colonies. */}
      {colonies
        .filter((_, i) => i % 3 === 0)
        .map((c, i) => (
          <circle
            key={`haze-${i}`}
            cx={c.cx}
            cy={c.cy}
            r={c.r * 2.6}
            fill="var(--color-ab-tank)"
            opacity={0.05}
          />
        ))}
      {colonies.map((c, i) => (
        <g key={i}>
          <circle
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            fill="var(--color-ab-tank)"
            opacity={c.opacity}
          />
          {c.ring ? (
            <circle
              cx={c.cx}
              cy={c.cy}
              r={c.r * 1.5}
              fill="none"
              stroke="var(--color-ab-tank)"
              strokeWidth={0.25}
              opacity={c.opacity * 0.55}
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}
