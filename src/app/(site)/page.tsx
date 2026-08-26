import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { ProofBar } from "@/components/sections/ProofBar";
import { ChallengeResponse } from "@/components/sections/ChallengeResponse";
import { MilkToCurdSection } from "@/components/sections/MilkToCurdSection";
import { SolutionGrid } from "@/components/sections/SolutionGrid";
import { SelectorTeaser } from "@/components/sections/SelectorTeaser";
import { GlobalReach } from "@/components/sections/GlobalReach";
import { CTABand } from "@/components/sections/CTABand";
import { StrainIndex } from "@/components/layout/StrainIndex";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { proposition } from "@/content/company";

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

      {/* 2 — Strain index rail */}
      <StrainIndex mode="ticker" />

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

            {/* Full-bleed to the section edge on desktop. The client's own
                in-process QC lab — parallaxed, because photography is the only
                thing on this site that is (Section 7A.7). */}
            <div className="relative aspect-[4/3] overflow-hidden lg:-mr-[max(0px,calc((100vw-1280px)/2+32px))] lg:aspect-[5/4]">
              <Photo
                src="/assets/facility/qc-lab.webp"
                alt="Checking a culture sample under the microscope at the Chinchwad plant"
                sizes="(min-width: 1024px) 50vw, 100vw"
                parallax
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4b — Milk to curd. The product's actual physical transformation, and
              the only pinned section on the site (Section 7A.4).

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
