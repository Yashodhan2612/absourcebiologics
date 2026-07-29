import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ChallengeResponse } from "@/components/sections/ChallengeResponse";
import { ValueTable } from "@/components/sections/ValueTable";
import { CTABand } from "@/components/sections/CTABand";
import { Photo } from "@/components/ui/Photo";
import { differentiators, milestones } from "@/content/company";
import { certifications } from "@/content/certifications";

export const metadata = pageMetadata({
  title: "Why ABsource | Indigenous DVS culture manufacturer",
  description:
    "Five differentiators, the six problems we solve, and what changes for your business. The page to forward when justifying a supplier switch.",
  path: "/why-absource",
});

/**
 * Photography for the five differentiator blocks.
 *
 * There are three usable plant photographs, so the set cycles. That is
 * deliberate: repeating a real photograph of the actual facility is more
 * honest, and reads better to a technical buyer, than padding the page out
 * with stock imagery of a laboratory that is not ours.
 *
 * A fourth photograph exists in the asset set (a team group photo at an
 * event). It is a phone selfie and does not hold up at this size — it is left
 * for /careers if the client wants it there. See CONTENT-TODO.md.
 */
const DIFFERENTIATOR_PHOTOS = [
  {
    src: "/assets/facility/plant-01.webp",
    alt: "The clean-room corridor at the ABsource plant in Chinchwad",
  },
  {
    src: "/assets/facility/fermentation.webp",
    alt: "Stainless-steel fermentation vessels in the production area",
  },
  {
    src: "/assets/facility/qc-lab.webp",
    alt: "A microbiologist at the in-process QC lab microscope",
  },
] as const;

/**
 * The differentiation page — the one a buyer forwards to their boss when
 * justifying a supplier switch. No pricing, no competitor names.
 */
export default function WhyAbsourcePage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Why ABsource", path: "/why-absource" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="Why ABsource"
            title="What actually changes when the culture is made here."
            lede="Five differences that hold up under procurement scrutiny, and the six problems they solve."
          />
        </div>
      </section>

      {/* Five differentiators as full-width alternating blocks. */}
      <section className="section-ab-tight">
        <div className="container-ab">
          <ul className="flex flex-col">
            {differentiators.map((item, i) => (
              <li
                key={item.id}
                className="grid items-center gap-10 border-b border-ab-chill py-14 lg:grid-cols-2 lg:gap-20"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                  <Eyebrow className="mb-5">{String(i + 1).padStart(2, "0")}</Eyebrow>
                  <h2 className="text-[1.75rem] leading-tight md:text-[2.25rem]">
                    {item.title}
                  </h2>
                  <p className="measure-ab mt-5 text-base leading-[1.65] text-ab-ink-60">
                    {item.body}
                  </p>
                </div>
                <div
                  className={`relative aspect-[16/10] overflow-hidden ${
                    i % 2 === 1 ? "lg:order-1" : ""
                  }`}
                >
                  <Photo
                    src={DIFFERENTIATOR_PHOTOS[i % DIFFERENTIATOR_PHOTOS.length]!.src}
                    alt={DIFFERENTIATOR_PHOTOS[i % DIFFERENTIATOR_PHOTOS.length]!.alt}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    parallax
                    depth={0.45}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Shared component with the homepage, lighter visual weight here. */}
      <section className="section-ab-tight bg-ab-white">
        <div className="container-ab">
          <SectionHeading
            eyebrow="What we solve"
            title="Six reasons plants stay on imported cultures."
            className="mb-12 max-w-3xl"
          />
          <ChallengeResponse weight="compact" />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <SectionHeading
            eyebrow="The value"
            title="What changes for your business."
            lede="These map to how a switch gets justified internally, so take them to the meeting in this order."
            className="mb-12 max-w-3xl"
          />
          <ValueTable audience="domestic" />
        </div>
      </section>

      {/* The pioneer timeline. The 2025 entry is stated plainly and without
          triumphalism — owning the fact is stronger than omitting it. */}
      <section className="ab-reversed section-ab-tight bg-ab-tank">
        <div className="container-ab">
          <SectionHeading
            tone="reversed"
            eyebrow="Timeline"
            title="Nine years ahead of the national push."
            className="mb-12 max-w-3xl"
          />
          <ol className="grid gap-px border border-ab-milk/15 bg-ab-milk/15 md:grid-cols-3">
            {milestones.map((m) => (
              <li key={m.year} className="bg-ab-tank p-8">
                <p className="mono-ab text-ab-ghee">{m.year}</p>
                <h3 className="mt-4 text-[1.5rem] text-ab-milk">{m.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.6] text-ab-tank-300">
                  {m.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-ab-tight border-b border-ab-chill">
        <div className="container-ab">
          <Eyebrow className="mb-8">Certified</Eyebrow>
          <ul className="flex flex-wrap gap-x-12 gap-y-4">
            {certifications.map((c) => (
              <li key={c.slug} className="font-display text-[1.5rem] tracking-[-0.02em] text-ab-tank">
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand
        title="Take this to your next supplier review."
        body="Send us the product you would switch first and we will send a sample and the parameters to trial it against."
        cta="Request a sample"
        secondaryHref="/quality"
        secondaryCta="See how we verify quality"
      />
    </>
  );
}
