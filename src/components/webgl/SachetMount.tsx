"use client";

import dynamic from "next/dynamic";
import { Suspense, useRef, useState } from "react";
import { PackShot } from "@/components/ui/PackShot";
import {
  useDeferredMount,
  useNearViewport,
  useRenderTier,
} from "@/components/motion/useRenderTier";

/**
 * The boundary around Moment 4 (Section 7A.6).
 *
 * Tier 2 and below get the flat pack photograph, which is perfectly good — it
 * is the same artwork, and it is what the buyer will compare against the pack
 * on their bench. Only tier 3 pays for the model.
 *
 * The model is only offered for DVS culture sachets. The ingredient and taste
 * maker SKUs ship in stand-up pouches, and their photography is already a
 * three-quarter render of that pouch; wrapping a stand-up pouch's artwork onto
 * a pillow-sachet model would misrepresent the pack a buyer receives.
 */
const Sachet = dynamic(() => import("./Sachet"), {
  ssr: false,
  loading: () => null,
});

export function SachetMount({
  image,
  name,
  slug,
  strainCode,
  category = "cultures",
}: {
  image: string;
  name: string;
  slug: string;
  strainCode?: string | undefined;
  category?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tier = useRenderTier();
  const near = useNearViewport(containerRef);
  const [failed, setFailed] = useState(false);

  const eligible = tier === 3 && category === "cultures" && !failed;
  const idle = useDeferredMount(eligible && near);
  const active = eligible && idle;

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* The flat pack always renders. It carries LCP on this page, it is what
          tier 1 and 2 see, and it is what stays on screen if the model fails
          to load — so the well is never empty and never shifts. */}
      <PackShot
        src={image}
        alt={`${name}${strainCode ? ` (${strainCode})` : ""} pack`}
        seed={strainCode ?? slug}
        sizes="(min-width: 1024px) 40vw, 100vw"
        priority
        className={active ? "opacity-0 transition-opacity duration-[400ms]" : ""}
      />

      {active ? (
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <Sachet image={image} onFailed={() => setFailed(true)} />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
