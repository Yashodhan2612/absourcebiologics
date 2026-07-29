"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { useRenderTier } from "./useRenderTier";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Scroll parallax for photography (Section 7A.7).
 *
 * The rules this enforces, because they are the difference between depth and
 * a page that feels unreliable:
 *
 *  - Photography only. NEVER text, never the header. Parallaxed text hurts
 *    readability and reads as broken.
 *  - Translation capped at +-48px at desktop widths and +-24px on mobile.
 *  - Foreground moves *slower* than background. The inverse reads as broken,
 *    so `depth` is clamped and the sign is not caller-controlled.
 *  - Disabled entirely at tier 1.
 *
 * The child is scaled slightly so the translated image never exposes an edge
 * of its container. That scale is why this wraps the media in an overflow
 * clip: without it, the bleed shows on the section boundary.
 */
export function Parallax({
  children,
  className,
  /** 0 = static, 1 = the full +-48px range. Clamped. */
  depth = 0.6,
}: {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const tier = useRenderTier();

  // Layout effect so the ScrollTriggers are killed before React detaches
  // the elements they are measuring. This one does not pin, so it cannot hit
  // the removeChild crash, but leaving triggers alive across a route change
  // leaks them and makes the next page's refresh() measure dead nodes.
  useIsomorphicLayoutEffect(() => {
    if (tier === null || tier === 1) return;

    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    let cancelled = false;
    let kill: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const clamped = Math.max(0, Math.min(1, depth));
      const range = (window.innerWidth >= 768 ? 48 : 24) * clamped;

      const tween = gsap.fromTo(
        inner,
        { yPercent: 0, y: -range },
        {
          y: range,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      kill = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(inner, { clearProps: "transform" });
      };
    })();

    return () => {
      cancelled = true;
      kill?.();
    };
  }, [tier, depth]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Oversized so the translation never exposes a container edge. The
          extra 12% covers the +-48px range at every realistic media height. */}
      <div ref={innerRef} className="absolute inset-0 -top-[6%] h-[112%] w-full">
        {children}
      </div>
    </div>
  );
}
