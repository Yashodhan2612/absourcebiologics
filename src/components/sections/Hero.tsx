import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CultureFieldMount } from "@/components/webgl/CultureFieldMount";
import { positioning } from "@/content/company";

/**
 * Homepage hero.
 *
 * The headline is the LCP element by design — server-rendered text with no
 * image or canvas behind it in the critical path. At tier 2 and above the
 * background is empty ab-milk until the canvas mounts, and the Streptococcus
 * chains then form onto it; tier 1 gets a static poster instead. A canvas must
 * never become the LCP element (Section 7A.1).
 *
 * Thirteen chains, one per DVS culture line — the same motif the StrainIndex
 * rail carries. That is not decorative trivia; keep it if you edit this.
 *
 * Contrast: the scrim below is the only thing keeping saturated magenta from
 * sitting under body copy, so it is load-bearing rather than decorative.
 * `node scripts/verify-hero.mjs` measures it against the real composited
 * frame at both desktop and phone widths. Run it if you touch the gradient.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-ab-chill">
      {/* Fixed-aspect background well. Absolutely positioned from first paint
          so nothing reflows when the canvas mounts later (CLS < 0.05). */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <CultureFieldMount />
        {/* Scrim. Solid ab-milk under the headline, opening up on the right so
            the chains are actually visible where there is no copy to protect.

            Held much stronger on mobile: the headline runs nearly the full
            width there, so a gradient tuned for a desktop two-column
            composition would put body copy straight over saturated magenta. */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-ab-milk from-30% via-ab-milk/92 via-66% to-ab-milk/30
                     md:from-20% md:via-ab-milk/90 md:via-56% md:to-ab-milk/5"
        />
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
