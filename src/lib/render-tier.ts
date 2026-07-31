/**
 * Device tiering for the 3D and scroll layer (Section 7A.2).
 *
 * This is the gate every WebGL component sits behind, and it is deliberately
 * the first thing built in the motion layer. A large share of this site's
 * audience browses on mid-range Android over Indian 4G, sometimes from a plant
 * office on a throttled connection. A hero that takes six seconds to appear
 * loses the sale before the copy is read.
 *
 *   Tier 3 — Full      every moment, 13 chains, DPR <= 1.75
 *   Tier 2 — Reduced   hero field only, 7 chains, DPR 1, no pinning,
 *                      flat pack shots instead of the sachet model
 *   Tier 1 — Static    zero WebGL, poster only, no parallax, no Lenis
 *
 * Tier 1 is not a failure state. The whole site is designed to be finished and
 * good with every canvas gone — see the honesty check in Section 7A.9, and
 * `?tier=1` below, which is how you run it.
 */

export type RenderTier = 1 | 2 | 3;

/**
 * Query-param override, shipped deliberately.
 *
 *   ?tier=1   force static — this is the honesty check, run it before you
 *             call any change to this layer done
 *   ?tier=2   force reduced
 *   ?tier=3   force full, bypassing detection (for testing only; a device that
 *             genuinely cannot hold 30fps will still be dropped by the
 *             PerformanceMonitor, which is the point)
 *   ?debug=perf  show the stats overlay
 *
 * It costs nothing in the bundle and makes field diagnosis on a real device in
 * a real dairy plant possible, which is not something we can reproduce here.
 */
function tierOverride(): RenderTier | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("tier");
  if (value === "1") return 1;
  if (value === "2") return 2;
  if (value === "3") return 3;
  return null;
}

export function isPerfDebug(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("debug") === "perf";
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * WebGL2 probe.
 *
 * Creates a throwaway context and immediately loses it — leaving probe contexts
 * alive burns one of the browser's small number of WebGL contexts, and on
 * mobile Safari that is enough to make the real canvas fail to acquire one.
 */
function hasWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

function connection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;
}

function deviceMemory(): number | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
}

/**
 * Synchronous part of the decision.
 *
 * Everything here is cheap and available on the first tick, so a component can
 * rule tier 1 out — or in — without waiting on detect-gpu's async benchmark.
 * Returns 1 for a definite tier-1 device, or null meaning "ask the GPU".
 */
function staticTierFloor(): RenderTier | null {
  if (prefersReducedMotion()) return 1;

  const net = connection();
  if (net?.saveData) return 1;
  if (net?.effectiveType && ["slow-2g", "2g", "3g"].includes(net.effectiveType)) {
    return 1;
  }

  if (!hasWebGL2()) return 1;

  return null;
}

let cached: Promise<RenderTier> | null = null;

/**
 * Resolve the render tier for this device. Memoised — detect-gpu runs a real
 * benchmark and must not be run once per canvas.
 */
export function detectRenderTier(): Promise<RenderTier> {
  if (cached) return cached;

  cached = (async (): Promise<RenderTier> => {
    const override = tierOverride();
    if (override !== null) return override;

    const floor = staticTierFloor();
    if (floor === 1) return 1;

    let gpuTier = 0;
    try {
      // Dynamic import: detect-gpu carries a benchmark table that has no
      // business in the initial bundle.
      const { getGPUTier } = await import("detect-gpu");
      const result = await getGPUTier({ failIfMajorPerformanceCaveat: false });
      gpuTier = result.tier ?? 0;
      // A device detect-gpu explicitly flags as mobile-and-weak, or that it
      // could not identify at all, is not given the benefit of the doubt.
      if (result.type === "FALLBACK") gpuTier = Math.min(gpuTier, 1);
    } catch {
      // detect-gpu failing is itself a signal; fall back to tier 2, which is
      // conservative but still shows the hero.
      return 2;
    }

    if (gpuTier === 0) return 1;

    const net = connection();
    const memory = deviceMemory();
    const wideEnough =
      typeof window !== "undefined" && window.innerWidth >= 1024;

    const full =
      gpuTier >= 2 &&
      // deviceMemory is absent on Safari. Treat absence as "unknown, allow" —
      // requiring it would demote every Mac and iPad to tier 2.
      (memory === undefined || memory >= 4) &&
      (net?.effectiveType === undefined || net.effectiveType === "4g") &&
      !net?.saveData &&
      wideEnough;

    return full ? 3 : 2;
  })();

  return cached;
}

/**
 * Device pixel ratio ceiling, by tier.
 *
 * The grid-resolution and step-rate helpers that used to live here went with
 * the Gray-Scott field. The Streptococcus field has no simulation grid — its
 * per-tier cost is chain and bokeh counts, which strepLayout.ts owns.
 */
export function maxDpr(tier: RenderTier): number {
  return tier >= 3 ? 1.75 : 1;
}
