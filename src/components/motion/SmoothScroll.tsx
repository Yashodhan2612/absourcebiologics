"use client";

import { useRenderTier } from "./useRenderTier";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Lenis smooth scroll, configured gently (Section 7A.7).
 *
 * This is smoothing, not scroll hijacking. It never changes scroll direction,
 * never adds horizontal scroll to a vertical page, and never traps the reader
 * in a section. If you find yourself reaching for any of those, the answer is
 * no — see Section 16.
 *
 * Disabled entirely at tier 1 (which includes prefers-reduced-motion) and on
 * touch devices, where the platform's own momentum scrolling is better than
 * anything we would put on top of it.
 *
 * Mounted once in the site layout. It renders nothing.
 */
export function SmoothScroll() {
  const tier = useRenderTier();

  useIsomorphicLayoutEffect(() => {
    if (tier === null || tier === 1) return;

    // Native momentum beats emulated momentum. Coarse pointer means touch.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let cancelled = false;
    // Populated asynchronously; the cleanup below closes over this object so
    // it can tear down whatever managed to start, in any order of resolution.
    const live: {
      lenis?: { raf(t: number): void; destroy(): void };
      removeTick?: () => void;
    } = {};

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ lerp: 0.09, duration: 1.0, wheelMultiplier: 1 });

      // ScrollTrigger must be told about Lenis's virtual scroll position, or
      // every pinned section in the site drifts out of sync with the page.
      lenis.on("scroll", ScrollTrigger.update);

      // Drive Lenis from GSAP's ticker rather than its own rAF loop, so the
      // scroll position and every scrubbed timeline advance on the same frame.
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // `html.lenis` disables the CSS `scroll-behavior: smooth` set in
      // globals.css — the two smoothing systems fight if both are live.
      document.documentElement.classList.add("lenis");

      live.lenis = lenis;
      live.removeTick = () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
      };
    })();

    return () => {
      cancelled = true;
      live.removeTick?.();
      live.lenis?.destroy();
      document.documentElement.classList.remove("lenis");
    };
  }, [tier]);

  return null;
}
