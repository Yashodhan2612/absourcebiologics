"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useDeferredMount, useRenderTier } from "@/components/motion/useRenderTier";
import { useIsomorphicLayoutEffect } from "@/components/motion/useIsomorphicLayoutEffect";

/**
 * The homepage's milk-to-curd moment (Section 7A.4), and the ONLY pinned
 * section on the site. The pinning budget is two; this spends one and nothing
 * else may spend the other without removing something.
 *
 * Rules this enforces:
 *  - Pins for at most 100vh of extra scroll. A reader is never held longer.
 *  - Never pins below 768px, and never at tier 1.
 *  - Tab moves focus straight past it — there is nothing focusable inside, so
 *    a keyboard user is never trapped in the pin (Section 7A.9).
 *
 * FALLBACK, and a deliberate departure from the brief. Section 7A.4 specifies
 * a 40-frame AVIF sequence for tier 2 and a before/after image pair for tier
 * 1. Both need renders of set curd that do not exist in the asset set, and
 * fabricating them — by any means — would put an invented picture of the
 * client's product on the page. So tier 1 and 2 get the same statement over
 * the real photograph of the fermentation vessels where the culture is
 * actually grown. It is honest, it is on-brand, and it is not pinned. If the
 * client supplies curd photography, the frame sequence becomes worth building.
 */
const MilkToCurd = dynamic(() => import("@/components/webgl/MilkToCurd"), {
  ssr: false,
  loading: () => null,
});

export function MilkToCurdSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const tier = useRenderTier();
  const [lost, setLost] = useState(false);

  const eligible = tier !== null && tier > 1 && !lost;
  const idle = useDeferredMount(eligible);
  const active = eligible && idle;

  // Layout effect, not useEffect — see useIsomorphicLayoutEffect for why the
  // choice of hook is what stops client-side navigation from crashing.
  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    const section = sectionRef.current;
    const pinTarget = pinRef.current;
    if (!section || !pinTarget) return;

    let cancelled = false;
    let kill: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      // matchMedia rather than a width check, so rotating a tablet across the
      // breakpoint tears the pin down instead of leaving it stuck.
      const context = gsap.matchMedia();
      context.add("(min-width: 768px)", () => {
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          // Exactly one viewport of extra scroll. Not "+=150%", not "+=200%".
          end: "+=100%",
          // Pin the INNER wrapper, never the <section> itself. Pinning wraps
          // the target in a .pin-spacer and moves it inside — so pinning the
          // section would move the section out of <main>, and React's
          // `main.removeChild(section)` on navigation would throw. Pinning a
          // child keeps that reparenting entirely inside the section, where
          // React never removes individual nodes: unmounting a subtree only
          // removes its top host node, which is still exactly where React
          // left it.
          pin: pinTarget,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        });
        return () => trigger.kill();
      });

      kill = () => context.revert();
    })();

    return () => {
      cancelled = true;
      kill?.();
    };
  }, [active]);

  return (
    <section
      ref={sectionRef}
      className="ab-reversed relative isolate overflow-hidden border-y border-ab-tank bg-ab-tank"
    >
      {/*
        The pin target. Always rendered, whatever the tier — GSAP must never
        be handed a node whose existence depends on state, and React must never
        be asked to remove a node GSAP has wrapped. Everything visible lives
        inside it, so pinning it holds the whole composition.
      */}
      <div
        ref={pinRef}
        className="relative flex min-h-[70vh] items-center overflow-hidden md:min-h-screen"
      >
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {active ? (
            <MilkToCurd
              tier={tier}
              progressRef={progressRef}
              onContextLost={() => setLost(true)}
            />
          ) : (
            <Photo
              src="/assets/facility/fermentation.webp"
              alt=""
              sizes="100vw"
              className="opacity-[0.35]"
            />
          )}
          {/* Scrim on the copy side only, so the surface stays fully visible
              where there is nothing to read over it. */}
          <div className="absolute inset-0 bg-gradient-to-r from-ab-tank from-15% via-ab-tank/80 via-50% to-ab-tank/10" />
        </div>

        <div className="container-ab">
          <div className="max-w-2xl">
            <Eyebrow className="mb-7 text-ab-tank-300">The set</Eyebrow>
            <p className="text-[2rem] leading-[1.05] tracking-[-0.03em] text-ab-milk md:text-[3.75rem]">
              Set curd that holds a clean cut.
            </p>
            <p className="measure-ab mt-7 text-[1.0625rem] leading-[1.65] text-ab-tank-300">
              Milk thickens, sets, and takes a clean break face — the attribute a
              curd plant is judged on, and the one a starter culture decides.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
