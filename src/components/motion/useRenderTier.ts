"use client";

import { useEffect, useState } from "react";
import { detectRenderTier, type RenderTier } from "@/lib/render-tier";

/**
 * Resolve the device's render tier (Section 7A.2).
 *
 * Returns `null` until detection settles. Callers must treat `null` as
 * "render the poster" rather than "render nothing" — detect-gpu's benchmark
 * takes a few frames, and a hole in the layout during that window is a layout
 * shift we have explicitly budgeted against (CLS < 0.05).
 */
export function useRenderTier(): RenderTier | null {
  const [tier, setTier] = useState<RenderTier | null>(null);

  useEffect(() => {
    let alive = true;
    detectRenderTier().then((resolved) => {
      if (alive) setTier(resolved);
    });
    return () => {
      alive = false;
    };
  }, []);

  return tier;
}

/**
 * True once the browser is idle enough to pay for a WebGL chunk.
 *
 * The hero headline must be the LCP element and a canvas must never be
 * (Section 7A.1), so nothing three-related is even imported until this flips.
 * requestIdleCallback where available, a 1500ms timeout everywhere else —
 * which is Safari, and is why the fallback is not optional.
 */
export function useDeferredMount(enabled = true): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const go = () => {
      if (!cancelled) setReady(true);
    };

    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWindow;

    if (typeof w.requestIdleCallback === "function") {
      const handle = w.requestIdleCallback(go, { timeout: 1500 });
      return () => {
        cancelled = true;
        w.cancelIdleCallback?.(handle);
      };
    }

    const timer = window.setTimeout(go, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled]);

  return ready;
}

/**
 * True while the element is anywhere near the viewport.
 *
 * Every canvas pauses when scrolled out of view (Section 7A.2). `rootMargin`
 * is generous so a scene has a moment to warm up before it is actually seen,
 * rather than popping in mid-scroll.
 */
export function useNearViewport<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  rootMargin = "200px"
): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setNear(entry.isIntersecting);
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return near;
}
