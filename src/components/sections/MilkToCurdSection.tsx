"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { useRenderTier } from "@/components/motion/useRenderTier";

/**
 * The homepage's set-curd moment (Section 7A.4).
 *
 * WHAT CHANGED, AND WHY THE PIN WENT.
 *
 * This section used to hold a pinned, scroll-scrubbed WebGL milk-to-curd
 * simulation, and it was pinned because the scrub needed scroll to drive it.
 * The client asked for the real thing instead: a short loop of curd being
 * scooped, playing behind the statement.
 *
 * A looping video has no scrub position, so pinning the reader for a full
 * viewport would hold them still for no payoff — the pin existed to serve the
 * simulation, and it left with it. The pinning budget it was spending is now
 * free; nothing else on the site pins.
 *
 * WHAT THE FOOTAGE IS. An illustrative macro shot of set curd taking a clean
 * spoon cut, and a slow push-in built from it. It is NOT a photograph of
 * ABsource product, and it must not be captioned as one. It is here because
 * the section makes a statement about what set curd should do and had no
 * imagery to carry it; the moment real plant footage exists, drop it in at the
 * same paths and delete this note. Recorded in CONTENT-TODO.md §0e.
 *
 * DELIVERY.
 *  - Muted, inline, looping and autoplaying — the only form of autoplay a
 *    browser will honour, and the only one that is acceptable without a
 *    control, because there is no audio and no information in it.
 *  - Tier 1 never downloads it. The poster frame is the whole experience
 *    there, which is 40KB against roughly 460KB.
 *  - Reduced motion never downloads it either. This is decorative motion, and
 *    the preference is a request not to be moved.
 *  - THE POSTER IS THE FALLBACK, and it needs no code. A <video> that cannot
 *    load or decode its source keeps showing its `poster` attribute, and the
 *    same still is painted behind it as an <Image> at every tier. There is
 *    deliberately no onError handler: the first version had one, and it was
 *    the only thing that ever broke this section — React delivers a child
 *    <source> error and a cancelled-load abort to the same handler, so a video
 *    that played perfectly was being torn down as "failed". Nothing to detect,
 *    nothing to get wrong.
 */

const POSTER = "/assets/editorial/curd-scoop.webp";

/**
 * H.264 only, deliberately.
 *
 * A VP9 WebM was served first because it is a third of the size, and it was a
 * mistake: it reported its metadata correctly and then failed to decode during
 * playback, which surfaces as MEDIA_ERR_DECODE on a video that looks loaded
 * and simply never advances. H.264 is decoded by every browser that will ever
 * see this page, in hardware, and 450KB for a background loop that only
 * downloads at tier 2+ with motion allowed is not worth a second format and a
 * capability check to shave.
 */
const VIDEO = "/assets/video/curd-scoop.mp4";

export function MilkToCurdSection() {
  const tier = useRenderTier();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [motionOk, setMotionOk] = useState(false);
  /**
   * The source is an ATTRIBUTE, not a list of <source> children.
   *
   * With children, React creates the <video>, sets its attributes, and only
   * then appends the sources — and the browser's resource selection algorithm
   * can run in that gap, find no source, and fire a real MEDIA_ERR error. The
   * element is then dead for good. That is what was happening here: the same
   * markup built imperatively played perfectly, while the React-rendered one
   * errored on mount every time and fell back to the poster.
   *
   * `src` is set at creation, so the window does not exist. WebM is a third of
   * the size, so it is used where the browser says it can decode VP9, and
   * everything else gets the H.264 MP4.
   */
  // Read the preference on the client only. Evaluating it during render would
  // produce a server/client mismatch, and reading it once on mount would miss
  // the reader who changes it with the page open.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference)");
    setMotionOk(query.matches);
    const onChange = (e: MediaQueryListEvent) => setMotionOk(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const showVideo = tier !== null && tier > 1 && motionOk;

  /**
   * Play while the section is on screen, pause when it is not.
   *
   * Asking once on mount is not enough and is also wasteful. Not enough,
   * because the element may not have buffered yet and the tab may not have
   * been interacted with, and a refused `play()` never retries — which is
   * exactly what happened: the video loaded, sat paused on its poster and
   * looked broken. Wasteful, because this section is several screens down and
   * decoding video the reader has not reached costs battery for nothing.
   *
   * So: retry on `canplay`, and let an IntersectionObserver start and stop it.
   * A refusal is still not an error — the poster is painted underneath, so a
   * browser that declines simply shows the still.
   */
  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let onScreen = false;
    const tryPlay = () => {
      if (onScreen) void video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? false;
        if (onScreen) tryPlay();
        else video.pause();
      },
      // A little before it arrives, so it is already running on entry.
      { rootMargin: "200px 0px", threshold: 0 }
    );
    observer.observe(section);
    video.addEventListener("canplay", tryPlay);

    return () => {
      observer.disconnect();
      video.removeEventListener("canplay", tryPlay);
    };
  }, [showVideo]);

  return (
    <section
      ref={sectionRef}
      className="ab-reversed relative isolate overflow-hidden border-y border-ab-tank bg-ab-tank"
    >
      <div className="relative flex min-h-[70vh] items-center overflow-hidden md:min-h-[80vh]">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {/* The poster is always painted, at every tier, so the video has
              something to reveal rather than a flash of empty tank. */}
          <Photo src={POSTER} alt="" sizes="100vw" />

          {showVideo ? (
            <video
              ref={videoRef}
              src={VIDEO}
              className="absolute inset-0 h-full w-full object-cover"
              poster={POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : null}

          {/*
            The footage runs at full opacity and the scrim does all the work.

            It used to sit at 55% over the tank ground, which greyed the curd
            to the colour of the section and made a food shot look like a
            technical diagram. Now the curd is the curd, and legibility is
            bought where it is actually needed: an almost-solid wedge under the
            copy on the left, fading to clear before the spoon. Contrast over
            the scrimmed area is measured by scripts/check-contrast.mjs.
          */}
          <div className="absolute inset-0 bg-gradient-to-r from-ab-tank from-20% via-ab-tank/85 via-42% to-transparent to-72%" />
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
