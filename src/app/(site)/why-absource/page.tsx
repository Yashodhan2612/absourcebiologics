import Link from "next/link";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ChallengeResponse } from "@/components/sections/ChallengeResponse";
import { ValueTable } from "@/components/sections/ValueTable";
import { CTABand } from "@/components/sections/CTABand";
import { Photo } from "@/components/ui/Photo";
import { differentiators, milestones } from "@/content/company";

export const metadata = pageMetadata({
  title: "Why an indigenous DVS culture manufacturer",
  description:
    "Five differentiators, the six problems we solve, and what changes for your business. The page to forward when justifying a supplier switch.",
  path: "/why-absource",
});

/**
 * Photography for the five differentiator blocks.
 *
 * One photograph per block, each used NOWHERE ELSE on the site — the client's
 * rule is that no photograph repeats anywhere. All five are from the plant
 * photography they supplied in October 2026.
 *
 * Each image is chosen to argue its own block rather than to decorate it:
 *  01 pioneer        — the clean-room corridor: the plant itself.
 *  02 science-led    — a technologist at the microscope.
 *  03 customisation  — the packing line, where different blends are filled to
 *                      different specifications. The closest thing we have to a
 *                      picture of "range".
 *  04 partnership    — two operators working one vessel together, as the
 *                      block's own copy has it: one company from idea to
 *                      plant. (It was the team in a meeting; the client sent
 *                      a sharper photograph of this subject in October 2026.)
 *  05 proven quality — a sample being measured at the bench.
 *
 * Block 5 used to show the four certificate scans. They now appear once, on
 * /quality, where they open full size and sit beside the FSSAI licence;
 * repeating them here would break the no-repeat rule, so this block shows the
 * testing behind them and links to the documents instead.
 */
const DIFFERENTIATOR_PHOTOS = [
  {
    src: "/assets/facility/clean-corridor.webp",
    alt: "The clean-room corridor at the ABsource plant in Chinchwad",
  },
  {
    src: "/assets/facility/microscope-bench.webp",
    alt: "A technologist examining a culture sample under the microscope",
  },
  {
    src: "/assets/facility/packing-line.webp",
    alt: "Two operators running the sachet sealer on the packing line",
  },
  {
    src: "/assets/facility/inoculation-vessel.webp",
    alt: "Two operators preparing an inoculation vessel together next to the autoclave",
  },
  {
    src: "/assets/facility/sample-bench.webp",
    alt: "A technologist taking a reading from a sample at the in-process QC bench",
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
            {differentiators.map((item, i) => {
              const photo = DIFFERENTIATOR_PHOTOS[i];
              return (
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
                  {/* The proof for this block is a set of documents, and they
                      live on /quality. Keyed on the id, not the position. */}
                  {item.id === "proven" ? (
                    <Link
                      href="/quality"
                      className="link-wipe mono-ab mt-6 inline-block text-ab-tank no-underline"
                    >
                      See the certificates and the FSSAI licence &rarr;
                    </Link>
                  ) : null}
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : undefined}>
                  {photo ? (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Photo
                        src={photo.src}
                        alt={photo.alt}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        parallax
                        depth={0.45}
                      />
                    </div>
                  ) : null}
                </div>
              </li>
              );
            })}
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
            title="In production nine years before the national plant opened."
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

      <CTABand
        title="Take this to your next supplier review."
        body="Send us the product you would switch first and we will send a sample and the parameters to trial it against."
        cta="Send us your spec"
        secondaryHref="/quality"
        secondaryCta="See how we verify quality"
      />
    </>
  );
}
