"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRenderTier } from "@/components/motion/useRenderTier";
import { isPerfDebug } from "@/lib/render-tier";

/**
 * The boundary between the static hero and the Streptococcus field.
 *
 * Everything three-related sits behind this dynamic import, so the initial
 * bundle never carries it. The canvas is absolutely positioned inside a
 * container the hero already sizes, so mounting it cannot shift a pixel of
 * layout (CLS < 0.05).
 *
 * NO CROSS-DISSOLVE FROM A POSTER, and that is a deliberate reversal of what
 * this component used to do. The hero's whole point is now that the chains lay
 * themselves down as the page loads. Showing a poster of fully-formed chains
 * first and then playing the formation would mean the reader watches the
 * chains appear, vanish, and appear again — the animation would read as a
 * glitch. So:
 *
 *   tier 1        -> the poster, formed and static. Nothing else is available
 *                    to it, and it has to look finished on its own.
 *   tier 2 and 3  -> no poster at all. Flat ab-milk until the canvas mounts,
 *                    then the chains form onto it.
 *
 * That also drops a 38KB image request for everyone who gets the canvas, and
 * makes the server-rendered headline the LCP element by construction — which
 * is what Section 7A.1 wanted in the first place.
 */
const CultureField = dynamic(() => import("./CultureField"), {
  ssr: false,
  loading: () => null,
});

export function CultureFieldMount() {
  const tier = useRenderTier();
  const [lost, setLost] = useState(false);
  // isPerfDebug() reads window.location, so it cannot be evaluated during the
  // server render or the first client render without a hydration mismatch.
  const [perfDebug, setPerfDebug] = useState(false);

  useEffect(() => setPerfDebug(isPerfDebug()), []);

  const canvas = tier !== null && tier > 1 && !lost;
  const poster = tier === 1 || lost;

  return (
    <div className="absolute inset-0">
      {poster ? (
        /*
         * Held back on narrow viewports. The canvas rebuilds its layout from
         * the viewport aspect, so a phone gets shorter chains and smaller
         * cells; the poster is a fixed 16:9 crop and cannot, so object-cover
         * scales it up and drops large saturated cells behind the eyebrow.
         * Measured at 4.32:1 there against a 4.5:1 requirement. Fading towards
         * the ab-milk section background underneath is the cheapest correct
         * fix — no second asset, no second request.
         */
        <Image
          src="/assets/webgl/culture-field-poster.avif"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55 md:opacity-100"
        />
      ) : null}

      {canvas ? <CultureField tier={tier} onContextLost={() => setLost(true)} /> : null}

      {perfDebug ? (
        <p className="mono-ab absolute bottom-3 right-3 z-10 bg-ab-ink/80 px-2 py-1 text-ab-milk">
          tier {tier ?? "?"} <span id="ab-perf-readout">—</span>
        </p>
      ) : null}
    </div>
  );
}
