"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDeferredMount, useRenderTier } from "@/components/motion/useRenderTier";
import { isPerfDebug } from "@/lib/render-tier";

/**
 * The boundary between the static hero and the WebGL culture field
 * (Sections 7A.1 and 7A.3).
 *
 * Everything three-related sits behind this dynamic import, so the initial
 * bundle never carries it. The poster ships in the server-rendered HTML and
 * carries the page on its own; the canvas cross-dissolves over it in 400ms
 * once the browser is idle, so there is no visible pop and nothing reflows.
 *
 * The canvas is absolutely positioned inside a container the hero already
 * sizes, so mounting it cannot shift a single pixel of layout (CLS < 0.05).
 * The headline is the LCP element and this never competes for that.
 */
const CultureField = dynamic(() => import("./CultureField"), {
  ssr: false,
  loading: () => null,
});

export function CultureFieldMount() {
  const tier = useRenderTier();
  // Tier 1 never loads the chunk at all — no point paying for the request.
  const idle = useDeferredMount(tier !== null && tier > 1);
  const [lost, setLost] = useState(false);
  const [painted, setPainted] = useState(false);
  // isPerfDebug() reads window.location, so it cannot be evaluated during the
  // server render or during the first client render without a hydration
  // mismatch. Resolving it in an effect keeps both trees identical.
  const [perfDebug, setPerfDebug] = useState(false);

  const active = tier !== null && tier > 1 && idle && !lost;

  useEffect(() => setPerfDebug(isPerfDebug()), []);

  // The canvas needs a frame or two to seed and warm up. Fading it in on the
  // next tick rather than on mount avoids a flash of empty ab-milk between the
  // poster going quiet and the field arriving.
  useEffect(() => {
    if (!active) {
      setPainted(false);
      return;
    }
    const timer = window.setTimeout(() => setPainted(true), 120);
    return () => window.clearTimeout(timer);
  }, [active]);

  return (
    <div className="absolute inset-0">
      {/* Poster. A pre-rendered still of this exact simulation, produced by
          scripts/generate-posters.mjs from the same thirteen colony seeds and
          the same feed/kill rates. This is what tier 1 sees, and it is what
          the page must look finished with — run `?tier=1` and check.

          It carries LCP (Section 7A.8), hence `priority`. The canvas never
          does. 38KB of AVIF stretched exactly as the display shader stretches
          the simulation texture, so the cross-dissolve has nothing to give
          away. */}
      <div
        className="absolute inset-0 transition-opacity duration-[400ms] ease-ab motion-reduce:transition-none"
        style={{ opacity: painted ? 0 : 1 }}
      >
        <Image
          src="/assets/webgl/culture-field-poster.avif"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {active ? (
        <div
          className="absolute inset-0 transition-opacity duration-[400ms] ease-ab"
          style={{ opacity: painted ? 1 : 0 }}
        >
          <CultureField tier={tier} onContextLost={() => setLost(true)} />
        </div>
      ) : null}

      {perfDebug ? (
        <p className="mono-ab absolute bottom-3 right-3 z-10 bg-ab-ink/80 px-2 py-1 text-ab-milk">
          tier {tier ?? "?"} <span id="ab-perf-readout">—</span>
        </p>
      ) : null}
    </div>
  );
}
