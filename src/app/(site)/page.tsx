import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/sections/Hero";
import { ProofBar } from "@/components/sections/ProofBar";
import { ChallengeResponse } from "@/components/sections/ChallengeResponse";
import { MilkToCurdSection } from "@/components/sections/MilkToCurdSection";
import { SolutionGrid } from "@/components/sections/SolutionGrid";
import { SelectorTeaser } from "@/components/sections/SelectorTeaser";
import { ProductRail } from "@/components/sections/ProductRail";
import { CertStrip } from "@/components/sections/CertStrip";
import { ClientWall } from "@/components/sections/ClientWall";
import { CTABand } from "@/components/sections/CTABand";
import { StrainIndex } from "@/components/layout/StrainIndex";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { CardLink, CardBody } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { proposition } from "@/content/company";
import { services } from "@/content/services";

export const metadata = pageMetadata({
  title: "DVS dairy starter cultures made in India | ABsource",
  description:
    "India's first indigenous DVS starter culture manufacturer. Direct Vat Set cultures developed and made in Pune, formulated for Indian dairy, delivered in 3–5 days.",
  path: "/",
});

/**
 * Homepage.
 *
 * The single job of this page is to convince a dairy plant's technical buyer,
 * inside fifteen seconds, that an Indian company can match imported culture
 * quality — and to give them one obvious next step.
 *
 * Note what is deliberately absent: no carousel hero, no testimonial slider,
 * no count-up-on-scroll statistics, no chatbot, no exit-intent popup, and no
 * country figure beside the customer count. The global ambition ("largest in
 * India, top three globally") is also absent — a procurement head does not buy
 * on your ambition, so it lives on /about and /careers instead.
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
      <section className="ab-reversed bg-ab-tank">
        <div className="container-ab">
          <div className="grid items-center gap-14 py-24 md:py-32 lg:grid-cols-2 lg:gap-24">
            <div>
              <Eyebrow className="mb-7 text-ab-tank-300">Why we exist</Eyebrow>
              <h2 className="text-[2rem] leading-[0.98] tracking-[-0.03em] text-ab-milk md:text-[2.75rem]">
                {proposition.headline}
              </h2>
              <div className="measure-ab mt-7 flex flex-col gap-5">
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
                alt="A microbiologist at the in-process QC lab microscope at the Chinchwad plant"
                sizes="(min-width: 1024px) 50vw, 100vw"
                parallax
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4b — Milk to curd. The product's actual physical transformation, and
              the only pinned section on the site (Section 7A.4). */}
      <MilkToCurdSection />

      {/* 5 — Challenge → response. The section that does the actual selling;
              it gets a full viewport and is not compressed. */}
      <section className="section-ab">
        <div className="container-ab">
          <SectionHeading
            eyebrow="What we solve"
            title="Six reasons plants stay on imported cultures, and what we do about each."
            className="mb-16 max-w-4xl"
          />
          <ChallengeResponse weight="full" />
        </div>
      </section>

      {/* 6 — Solutions grid */}
      <section className="section-ab border-t border-ab-chill bg-ab-white">
        <div className="container-ab">
          <SectionHeading
            eyebrow="Solutions"
            title="Start from what you are making."
            lede="Each application page carries the technical challenge, the cultures we would trial, and the process parameters."
            className="mb-16"
          />
          <SolutionGrid />
        </div>
      </section>

      {/* 7 — Culture Selector teaser, live and inline */}
      <section className="section-ab bg-ab-chill/60">
        <div className="container-ab">
          <SelectorTeaser />
        </div>
      </section>

      {/* 8 — Products rail */}
      <section className="section-ab">
        <div className="container-ab mb-12">
          <SectionHeading
            eyebrow="The range"
            title="Thirteen DVS culture lines."
            lede="Every culture carries a strain code. Freeze-dried, phage-resistant, and ready for the vat."
          />
        </div>
        <ProductRail />
        <div className="container-ab mt-10">
          <ButtonLink href="/products" variant="secondary">
            See the full catalogue
          </ButtonLink>
        </div>
      </section>

      {/* 9 — Custom culture development. The highest-margin service, and
              invisible on the live site. Kept quiet and full-width. */}
      <section className="section-ab border-y border-ab-chill">
        <div className="container-ab">
          <Reveal className="max-w-4xl">
            <Eyebrow className="mb-7">Custom development</Eyebrow>
            <p className="text-[1.75rem] leading-[1.15] tracking-[-0.02em] text-ab-ink md:text-[2.75rem] md:leading-[1.05]">
              If the culture you need does not exist yet, we build it. Our scientists
              develop new blends from scratch to your product spec &mdash; which an
              importer, structurally, cannot do.
            </p>
            <ButtonLink
              href="/services/custom-culture-development"
              variant="secondary"
              size="lg"
              className="mt-10"
            >
              Describe what you&rsquo;re trying to make
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* 10 — Quality band */}
      <section className="section-ab bg-ab-white">
        <div className="container-ab">
          <SectionHeading
            eyebrow="Quality"
            title="How we make the consistency claim stand up."
            className="mb-16 max-w-3xl"
          />
          <CertStrip />
        </div>
      </section>

      {/* 11 — Client wall */}
      <section className="section-ab border-t border-ab-chill">
        <div className="container-ab">
          <ClientWall />
        </div>
      </section>

      {/* 12 — Services */}
      <section className="section-ab bg-ab-chill/40">
        <div className="container-ab">
          <SectionHeading
            eyebrow="Services"
            title="The work around the culture."
            className="mb-16"
          />
          <ul className="grid gap-px border border-ab-chill bg-ab-chill md:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug}>
                <CardLink href={`/services/${service.slug}`} className="h-full border-0">
                  <CardBody className="flex h-full flex-col gap-3 p-8">
                    <h3 className="text-[1.5rem] text-ab-ink">{service.name}</h3>
                    <p className="text-[0.9375rem] leading-[1.55] text-ab-ink-60">
                      {service.summary}
                    </p>
                    <span className="mono-ab mt-auto pt-6 text-ab-tank">
                      What&rsquo;s included &rarr;
                    </span>
                  </CardBody>
                </CardLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 13 — CTA band */}
      <CTABand
        title="Send us your product spec. We'll send back a culture recommendation and a sample."
        body="Tell us what you are making, the texture and acidity you are targeting, and the volumes you run. A technologist replies — not a form letter."
        cta="Request a sample"
        secondaryHref="/culture-selector"
        secondaryCta="Find your culture"
      />
    </>
  );
}
