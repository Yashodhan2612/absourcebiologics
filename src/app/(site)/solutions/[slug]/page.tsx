import { notFound } from "next/navigation";
import Link from "next/link";
import { pageMetadata, BreadcrumbJsonLd, FaqJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { StrainCode } from "@/components/ui/StrainCode";
import { ColonyPlate } from "@/components/ui/ColonyPlate";
import { SolutionIcon } from "@/components/ui/SolutionIcon";
import { SpecTable } from "@/components/sections/SpecTable";
import { CTABand } from "@/components/sections/CTABand";
import { solutions, solutionBySlug } from "@/content/solutions";
import { productsByApplication } from "@/content/products";

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = solutionBySlug(slug);
  if (!solution) return {};
  return pageMetadata({
    title: `${solution.name} cultures | ABsource Biologics`.slice(0, 60),
    description: `${solution.headline} ${solution.summary}`.slice(0, 155),
    path: `/solutions/${slug}`,
  });
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = solutionBySlug(slug);
  if (!solution) notFound();

  // Recommended SKUs are pulled by tag rather than hand-listed, so adding a
  // product with this application tag surfaces it here automatically.
  const recommended = productsByApplication(solution.slug).slice(0, 4);

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
          { name: solution.name, path: `/solutions/${slug}` },
        ]}
      />
      <FaqJsonLd faqs={solution.faqs} />

      <section className="relative isolate overflow-hidden border-b border-ab-chill">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {/* Full-bleed atmospheric ground, which is what ColonyPlate is for.
              A pack shot does not work here: it is object-contain by necessity
              (cropping a sachet cuts off the strain code), so at 100vw it
              floats in the middle of the hero looking like a mistake. Pack
              photography belongs on the solution cards, where the media well
              is card-sized and the contain fit reads correctly. */}
          <ColonyPlate seed={solution.slug} density={130} />
          <div className="absolute inset-0 bg-gradient-to-r from-ab-milk via-ab-milk/92 to-ab-milk/60" />
        </div>
        <div className="container-ab py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="mb-7 flex items-center gap-3">
              <SolutionIcon slug={solution.slug} className="h-6 w-6 text-ab-tank" />
              <span className="mono-ab text-ab-ink-60">{solution.name}</span>
            </div>
            <h1 className="text-[2.75rem] leading-[0.95] tracking-[-0.03em] md:text-[3.75rem]">
              {solution.headline}
            </h1>
          </div>
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <SectionHeading eyebrow="The challenge" title="What usually goes wrong." className="mb-8" />
              <div className="flex flex-col gap-5">
                {solution.challenge.map((para) => (
                  <p key={para} className="measure-ab text-base leading-[1.65] text-ab-ink-60">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-8 text-[2rem]">Process parameters</h2>
              <SpecTable rows={solution.processParameters} downloadHref="/downloads" />
            </div>
          </div>
        </div>
      </section>

      {recommended.length > 0 ? (
        <section className="section-ab-tight border-t border-ab-chill bg-ab-white">
          <div className="container-ab">
            <SectionHeading
              eyebrow="Recommended"
              title="What we would trial."
              className="mb-10"
            />
            <ul className="grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((product) => (
                <li key={product.slug} className="bg-ab-white">
                  <Link
                    href={`/products/${product.category}/${product.slug}`}
                    className="group flex h-full flex-col gap-3 p-6 no-underline"
                  >
                    {product.strainCode ? (
                      <StrainCode code={product.strainCode} tone="muted" />
                    ) : null}
                    <span className="font-display text-[1.25rem] tracking-[-0.02em] text-ab-ink transition-colors duration-150 ease-ab group-hover:text-ab-tank">
                      {product.name}
                    </span>
                    <span className="text-[0.875rem] leading-[1.5] text-ab-ink-60">
                      {product.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {solution.faqs.length > 0 ? (
        <section className="section-ab-tight">
          <div className="container-ab max-w-3xl">
            <h2 className="mb-8 text-[2rem]">Questions we get asked</h2>
            <Accordion items={solution.faqs.map((f) => ({ q: f.q, a: <p>{f.a}</p> }))} />
          </div>
        </section>
      ) : null}

      <CTABand
        title={`Send us your ${solution.name.toLowerCase()} spec.`}
        body="Tell us the texture and acidity you are targeting and the volumes you run. A technologist replies with a recommendation and a sample."
        href={`/request-a-quote?application=${solution.slug}`}
        cta="Request a sample"
      />
    </>
  );
}
