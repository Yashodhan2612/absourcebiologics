import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CultureFieldMount } from "@/components/webgl/CultureFieldMount";
import { positioning } from "@/content/company";

/**
 * Homepage hero.
 *
 * The headline is the LCP element by design — it is server-rendered text with
 * no image or canvas behind it in the critical path. The background starts as
 * an inline SVG colony field (no network request at all); the WebGL Gray-Scott
 * culture field cross-dissolves over it once the browser is idle, and only at
 * tier 2 and above. A canvas must never become the LCP element (Section 7A.1).
 *
 * The background is seeded with the thirteen strain codes — one per DVS
 * culture line — which is the same seeding the Gray-Scott simulation uses.
 * That is not decorative trivia; keep it if you edit this.
 *
 * Contrast: the plate draws in ab-tank at low opacity over ab-chill, and the
 * headline sits on an ab-milk scrim, so ab-ink text clears 4.5:1 at every
 * point regardless of which colonies land behind it.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-ab-chill">
      {/* Fixed-aspect background well. Absolutely positioned from first paint
          so nothing reflows when the canvas mounts later (CLS < 0.05). */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <CultureFieldMount />
        {/* Scrim: guarantees headline contrast over any part of the field, at
            every point in the simulation. The right edge stays open at 55% so
            the colonies are actually visible where there is no copy. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ab-milk from-25% via-ab-milk/90 via-55% to-ab-milk/25" />
      </div>

      <div className="container-ab">
        <div className="flex min-h-[min(88vh,860px)] flex-col justify-center py-24 md:py-32">
          <div className="max-w-4xl">
            <Eyebrow className="mb-8">
              India&rsquo;s first DVS culture manufacturer &middot; Est. 2014
            </Eyebrow>

            <h1 className="text-[2.75rem] leading-[0.95] tracking-[-0.03em] sm:text-[3.75rem] lg:text-[5.25rem]">
              {positioning.thesis}
            </h1>

            <p className="measure-ab mt-8 text-[1.25rem] leading-[1.5] text-ab-ink-60">
              {positioning.subhead}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/culture-selector" size="lg">
                Find your culture
              </ButtonLink>
              <ButtonLink href="/request-a-quote" variant="secondary" size="lg">
                Request a sample
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
