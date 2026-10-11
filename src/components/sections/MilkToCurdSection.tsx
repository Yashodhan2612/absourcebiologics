import { Photo } from "@/components/ui/Photo";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * The homepage's set-curd moment (Section 7A.4).
 *
 * A STILL IMAGE, AND NOTHING ELSE. This section has been three things: a
 * pinned, scroll-scrubbed WebGL milk-to-curd simulation; then a looping video
 * of curd taking a spoon cut; and now the single photograph that video was
 * built from. The client asked for the motion to go — the loop was a slow
 * push-in over one frame, and it read as the picture vibrating behind the
 * headline rather than as footage.
 *
 * So there is no <video>, no parallax and no scroll behaviour here, on any
 * device or render tier. Do not pass `parallax` to the Photo below: a moving
 * background is exactly what was removed. With nothing to play, pause or
 * observe, this is a server component and ships no JavaScript of its own.
 *
 * WHAT THE IMAGE IS. An illustrative macro shot of set curd taking a clean
 * spoon cut. It is NOT a photograph of ABsource product, and it must not be
 * captioned as one. It is here because the section makes a statement about
 * what set curd should do and had no imagery to carry it; the moment a real
 * photograph exists, drop it in at the same path and delete this note.
 * Recorded in CONTENT-TODO.md §0e.
 */

const IMAGE = "/assets/editorial/curd-scoop.webp";

export function MilkToCurdSection() {
  return (
    <section className="ab-reversed relative isolate overflow-hidden border-y border-ab-tank bg-ab-tank">
      <div className="relative flex min-h-[70vh] items-center overflow-hidden md:min-h-[80vh]">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <Photo src={IMAGE} alt="" sizes="100vw" />

          {/*
            The photograph runs at full opacity and the scrim does all the work.

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
