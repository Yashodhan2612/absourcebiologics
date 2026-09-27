import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { ProofBar } from "@/components/sections/ProofBar";
import { ChallengeResponse } from "@/components/sections/ChallengeResponse";
import { MilkToCurdSection } from "@/components/sections/MilkToCurdSection";
import { FeaturedCultures } from "@/components/sections/FeaturedCultures";
import { SolutionGrid } from "@/components/sections/SolutionGrid";
import { SelectorTeaser } from "@/components/sections/SelectorTeaser";
import { GlobalReach } from "@/components/sections/GlobalReach";
import { CTABand } from "@/components/sections/CTABand";
import { ProductCodeIndex } from "@/components/layout/ProductCodeIndex";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { proposition, capabilities } from "@/content/company";

export const metadata = pageMetadata({
  title: "DVS dairy starter cultures made in India",
  description:
    "India's first indigenous DVS starter culture manufacturer. Direct Vat Set cultures made in Pune, supplied across India and to export markets.",
  path: "/",
});

/**
 * Homepage.
 *
 * The single job of this page is to convince a dairy plant's technical buyer,
 * inside fifteen seconds, that ABsource can match imported culture quality —
 * and to give them one obvious next step.
 *
 * REWRITTEN AFTER CLIENT REVIEW. It used to run thirteen sections and repeat
 * most of the site back at itself. Four blocks were removed outright because
 * another page already carries them in more detail:
 *
 *   - the product rail          -> /products (the strain ticker above already
 *                                   links every culture page)
 *   - the certification strip   -> /quality (this was the certifications'
 *                                   THIRD appearance on one page)
 *   - the client wall           -> /customers (identical markup and copy)
 *   - the services grid         -> /services (verbatim the hub's own H1 and
 *                                   summaries)
 *
 * and the challenge/response table dropped from six rows to three, with a link
 * to the other three. Do not re-add them. The rule the client gave is: the
 * homepage does not explain what another section explains in detail.
 *
 * Deleting the services grid orphaned two service pages from the footer — they
 * were added to footerNav in nav.ts as the mitigation. Check that before
 * removing anything else.
 *
 * Ground rhythm, so no two adjacent sections share a ground with no rule
 * between them: milk, milk, white, tank, tank, milk, white, chill, white,
 * milk, tank. Every light-to-light boundary carries exactly one 1px ab-chill
 * rule, always owned by the LOWER section's border-t, so no boundary doubles.
 *
 * Still deliberately absent: carousel hero, testimonial slider, count-up
 * statistics, chatbot, exit-intent popup, and any country figure beside the
 * customer count.
 */
export default function HomePage() {
  return (
    <>
      {/* 1 — Hero */}
      <Hero />

      {/* 2 — Product code rail */}
      <ProductCodeIndex mode="ticker" />

      {/* 3 — Proof bar */}
      <ProofBar />

      {/* 4 — The thesis, reversed */}
      <section className="ab-reversed section-ab bg-ab-tank">
        <div className="container-ab">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <Eyebrow className="mb-5 text-ab-tank-300">Why we exist</Eyebrow>
              <h2 className="text-[2rem] leading-[0.98] tracking-[-0.03em] text-ab-milk md:text-[2.75rem]">
                {proposition.headline}
              </h2>
              <div className="measure-ab mt-6 flex flex-col gap-5">
                {proposition.body.map((para) => (
                  <p key={para} className="text-base leading-[1.65] text-ab-tank-300">
                    {para}
                  </p>
                ))}
              </div>
              <Link
                href="/why-absource"
                className="link-wipe mono-ab mt-8 inline-block text-ab-ghee no-underline"
              >
                What that changes for you &rarr;
              </Link>
            </div>

            {/*
              Three photographs rather than one, because the claim is about
              three separate rooms and a single picture cannot carry it. These
              are the client's own recent plant photographs: fermentation
              control, aseptic transfer at the laminar bench, and the
              lyophiliser. The tall frame leads; only it is parallaxed, because
              three parallaxed frames at different rates on one screen reads as
              a fault (Section 7A.7).

              Full-bleed to the section edge on desktop.
            */}
            <div className="grid grid-cols-2 gap-3 lg:-mr-[max(0px,calc((100vw-1280px)/2+32px))]">
              {/* No aspect ratio on the tall frame. The two stacked 4:3
                  frames on the right define the row heights, and this spans
                  both — so it stretches to exactly their combined height plus
                  the gap. Giving it its own aspect made the two columns end at
                  different heights, which read as a broken grid. */}
              <div className="relative row-span-2 overflow-hidden">
                <Photo
                  src="/assets/facility/fermenter-control.webp"
                  alt="Two operators running a fermentation vessel from its control panel in the ABsource clean room"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  parallax
                  depth={0.4}
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Photo
                  src="/assets/facility/aseptic-transfer.webp"
                  alt="A technician working at a laminar flow bench during an aseptic transfer"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Photo
                  src="/assets/facility/freeze-dryer.webp"
                  alt="Loading trays into the freeze dryer at the Chinchwad plant"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </div>
            </div>
          </div>

          {/*
            The four capabilities that make "we are not traders" checkable.
            Reversed section, so the rules are milk at low alpha rather than
            ab-chill, which would disappear against the tank.
          */}
          <ul className="mt-16 grid gap-px border border-ab-milk/15 bg-ab-milk/15 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item) => (
              <li key={item.id} className="flex flex-col bg-ab-tank p-6 lg:p-7">
                <h3 className="text-[1.0625rem] leading-[1.35] text-ab-milk">
                  {item.title}
                </h3>
                {item.body ? (
                  <p className="mt-3 text-[0.9375rem] leading-[1.6] text-ab-tank-300">
                    {item.body}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 4b — Set curd. The product's actual output, behind a short loop of
              curd taking a clean spoon cut.

              No longer pinned: the pin existed to scrub a WebGL simulation
              that the client replaced with real footage, and a looping video
              has no scrub position. Nothing on the site pins now.

              Do not edit the copy inside it: verify-webgl.mjs finds this
              section by the literal string "holds a clean cut". */}
      <MilkToCurdSection />

      {/* 5 — Challenge → response, three rows of six.
              The other three are one click away on /why-absource, which is
              where a buyer justifying a switch actually reads them. */}
      <section className="section-ab-tight">
        <div className="container-ab">
          <SectionHeading
            eyebrow="What we solve"
            title="Consistency, cost, and the skills you don't need to hire."
            className="mb-12 max-w-4xl"
          />
          <ChallengeResponse
            weight="compact"
            pick={["inconsistent-quality", "production-cost", "expertise-gap"]}
          />
          <Link
            href="/why-absource"
            className="link-wipe mono-ab mt-8 inline-block text-ab-tank no-underline"
          >
            The other three, and what changes for your business &rarr;
          </Link>
        </div>
      </section>

      {/* 6 — Solutions grid. The homepage's main navigational engine. */}
      <section className="section-ab border-t border-ab-chill bg-ab-white">
        <div className="container-ab">
          <SectionHeading
            eyebrow="Solutions"
            title="Eight dairy applications."
            className="mb-12"
          />
          <SolutionGrid />
        </div>
      </section>

      {/* 6b — Featured lines. Cultures the client asked to pull out of the
              catalogue and bill separately. Takes the page ground so the
              white solutions grid above and the chill selector below still
              alternate, and owns the single rule on its upper boundary. */}
      <FeaturedCultures />

      {/* 7 — Culture Selector teaser, live and inline. The page's single
              obvious next step. */}
      <section className="section-ab border-y border-ab-chill bg-ab-chill/40">
        <div className="container-ab">
          <SelectorTeaser />
        </div>
      </section>

      {/* 8 — The market, widened. Added at the client's request: the page was
              framed entirely on Indian dairy. */}
      <GlobalReach />

      {/* 9 — Custom culture development. The highest-margin service, and
              invisible on the live site. */}
      <section className="section-ab-tight border-t border-ab-chill">
        <div className="container-ab">
          <div className="border border-ab-chill bg-ab-white p-8 md:p-14">
            <Eyebrow className="mb-5">Custom development</Eyebrow>
            <h2 className="max-w-3xl text-[1.75rem] leading-[1.15] tracking-[-0.02em] text-ab-ink md:text-[2.25rem] md:leading-[1.1]">
              If the culture you need does not exist yet, we build it.
            </h2>
            <p className="measure-ab mt-6 text-base leading-[1.65] text-ab-ink-60">
              Our scientists develop new blends from scratch to your product spec.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <ButtonLink
                href="/services/custom-culture-development"
                variant="secondary"
                size="lg"
              >
                Describe what you&rsquo;re trying to make
              </ButtonLink>
              <Link
                href="/services"
                className="link-wipe mono-ab text-ab-tank no-underline"
              >
                All three services &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10 — CTA band.
              href is written explicitly. Omitting it falls back to
              /request-a-quote, which would quietly undo the client's request
              to route sample requests through the product pages. */}
      <CTABand
        title="Pick the culture you want to trial, and we'll send a sample."
        body="Each culture page carries its specification and a sample request that arrives with the product already attached. If you are not sure which line fits, the selector narrows the range to three."
        href="/products?category=cultures"
        cta="Choose a culture to trial"
        secondaryHref="/culture-selector"
        secondaryCta="Find your culture"
      />
    </>
  );
}
