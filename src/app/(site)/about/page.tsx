import Link from "next/link";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CTABand } from "@/components/sections/CTABand";
import { Photo } from "@/components/ui/Photo";
import {
  marketArgument,
  vision,
  promise,
  milestones,
  company,
} from "@/content/company";

export const metadata = pageMetadata({
  title: "About ABsource Biologics | Founded Pune, 2014",
  description:
    "Indian demand for quality dairy starters is rising while almost nobody manufactures them here. That gap is why ABsource exists.",
  path: "/about",
});

/**
 * About.
 *
 * Opens with the market argument — demand-side pull against a supply-side
 * vacuum — rather than a mission statement, because it is the strongest thing
 * in the source material and it explains the company in one move.
 *
 * The 2025 note is deliberately included and deliberately understated. Owning
 * that fact here is far stronger than having a buyer find it elsewhere, and it
 * turns the event into validation of the original thesis. It names no
 * organisation and diminishes nobody — several likely customers are
 * cooperatives inside that ecosystem.
 */
export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="About"
            title={marketArgument.heading}
            className="max-w-4xl"
          />
          <div className="measure-ab mt-8 flex flex-col gap-5">
            {marketArgument.body.map((para) => (
              <p key={para} className="text-[1.25rem] leading-[1.5] text-ab-ink-60">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <SectionHeading eyebrow="The story" title="From 2014 to a working range." className="mb-8" />
              <div className="measure-ab flex flex-col gap-5 text-base leading-[1.65] text-ab-ink-60">
                <p>
                  ABsource Biologics was founded in Pune in {company.foundedYear} by
                  Dr. Mukesh Vinze and Mr. Jagannath Sonavane &mdash; a scientist and a
                  biotechnologist &mdash; as a group company of {company.group}.
                </p>
                <p>
                  In {company.firstCommercialYear} the first commercial Direct Vat Set
                  range reached production, making ABsource the first Indian manufacturer
                  of DVS dairy starter cultures. Before that, essentially every Indian
                  dairy plant bought its starters as imports: priced in foreign currency,
                  weeks of lead time, and no way to tune a blend for mishti doi or
                  shrikhand.
                </p>
                <p>
                  The range now runs to thirteen culture lines, seven dairy ingredients
                  and a taste maker, supplied to 300+ customers from a clean-room
                  facility with an in-process QC lab.
                </p>
              </div>
              <Link
                href="/about/leadership"
                className="link-wipe mono-ab mt-8 inline-block text-ab-tank no-underline"
              >
                Meet the founders &rarr;
              </Link>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Photo
                src="/assets/facility/plant-01.webp"
                alt="The clean-room corridor at the ABsource plant, Kinetic Innovation Park, Chinchwad"
                sizes="(min-width: 1024px) 50vw, 100vw"
                parallax
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our promise — four commitments, parallel structure retained. */}
      <section className="ab-reversed section-ab-tight bg-ab-tank">
        <div className="container-ab">
          <SectionHeading
            tone="reversed"
            eyebrow="Our promise"
            title="Four commitments."
            className="mb-14 max-w-2xl"
          />
          <ul className="grid gap-px border border-ab-milk/15 bg-ab-milk/15 sm:grid-cols-2">
            {promise.commitments.map((c) => (
              <li key={c.title} className="bg-ab-tank p-8">
                <h3 className="text-[1.5rem] text-ab-milk">{c.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.6] text-ab-tank-300">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
          <p className="measure-ab mt-12 text-[1.25rem] leading-[1.5] text-ab-milk">
            {promise.closing}
          </p>
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <Eyebrow className="mb-5">Vision</Eyebrow>
              <h2 className="text-[2rem] leading-[1.05] md:text-[2.75rem]">
                {vision.body}
              </h2>
            </div>
            <div>
              <Eyebrow className="mb-5">Milestones</Eyebrow>
              <ol className="border-t border-ab-chill">
                {milestones.map((m) => (
                  <li key={m.year} className="grid gap-2 border-b border-ab-chill py-6 sm:grid-cols-[5rem_1fr] sm:gap-6">
                    <span className="mono-ab text-ab-tank">{m.year}</span>
                    <div>
                      <h3 className="text-[1.25rem] text-ab-ink">{m.title}</h3>
                      <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                        {m.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        title="Come and see what we make."
        body="Send us a product you would like to make better, and we will send a culture recommendation and a sample."
        cta="Request a sample"
        secondaryHref="/quality"
        secondaryCta="How we verify quality"
      />
    </>
  );
}
