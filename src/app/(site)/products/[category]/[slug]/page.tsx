import { notFound } from "next/navigation";
import Link from "next/link";
import { pageMetadata, ProductJsonLd, BreadcrumbJsonLd } from "@/lib/seo";
import { StrainCode } from "@/components/ui/StrainCode";
import { ChipLink } from "@/components/ui/Chip";
import { SachetMount } from "@/components/webgl/SachetMount";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { SpecTable } from "@/components/sections/SpecTable";
import { CTABand } from "@/components/sections/CTABand";
import {
  products,
  productBySlug,
  CATEGORY_LABELS,
  CULTURE_TYPE_LABELS,
} from "@/content/products";
import { solutions } from "@/content/solutions";
import { downloadsForProduct } from "@/content/downloads";

export function generateStaticParams() {
  return products.map((p) => ({ category: p.category, slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = productBySlug(category, slug);
  if (!product) return {};

  const code = product.strainCode ? ` (${product.strainCode})` : "";
  return pageMetadata({
    title: `${product.name}${code} — ${product.summary}`.slice(0, 60),
    description: product.description.slice(0, 155),
    path: `/products/${category}/${slug}`,
  });
}

/**
 * Product detail — the page a QA manager actually evaluates.
 *
 * Section 13 bans self-reliance and Make-in-India language on product detail
 * pages outright: someone assessing a strain spec does not want a national
 * pride paragraph in the middle of it. The "why this over an imported
 * equivalent" bullets are therefore framed on lead time, currency and access
 * to the people who make the culture — all operational, none patriotic.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = productBySlug(category, slug);
  if (!product) notFound();

  const relatedApps = solutions.filter((s) =>
    (product.applications as readonly string[]).includes(s.slug)
  );
  const related = products
    .filter(
      (p) =>
        p.slug !== product.slug &&
        p.applications.some((a) =>
          (product.applications as readonly string[]).includes(a)
        )
    )
    .slice(0, 3);

  const docs = downloadsForProduct(product.slug);
  const quoteHref = `/request-a-quote?sku=${product.slug}`;

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          {
            name: CATEGORY_LABELS[product.category] ?? product.category,
            path: `/products?category=${product.category}`,
          },
          { name: product.name, path: `/products/${category}/${slug}` },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab">
          <div className="grid gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-20">
            <div className="relative aspect-[4/5] overflow-hidden border border-ab-chill">
              <SachetMount
                image={product.image}
                name={product.name}
                slug={product.slug}
                strainCode={product.strainCode ?? undefined}
                category={product.category}
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-6 flex items-center gap-3">
                {product.strainCode ? <StrainCode code={product.strainCode} /> : null}
                <Eyebrow>{CATEGORY_LABELS[product.category]}</Eyebrow>
              </div>

              <h1 className="text-[2.75rem] leading-[0.95] tracking-[-0.03em] md:text-[3.75rem]">
                {product.name}
              </h1>

              <p className="measure-ab mt-6 text-[1.25rem] leading-[1.5] text-ab-ink-60">
                {product.description}
              </p>

              {relatedApps.length > 0 ? (
                <div className="mt-8">
                  <Eyebrow className="mb-3">Applications</Eyebrow>
                  <div className="flex flex-wrap gap-2">
                    {relatedApps.map((s) => (
                      <ChipLink key={s.slug} href={`/solutions/${s.slug}`}>
                        {s.name}
                      </ChipLink>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-10 flex flex-wrap gap-4">
                <ButtonLink href={quoteHref} size="lg">
                  Request a sample
                </ButtonLink>
                {docs[0] ? (
                  <ButtonLink
                    href={`/downloads?doc=${docs[0].slug}`}
                    variant="secondary"
                    size="lg"
                  >
                    Download the data sheet
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <div className="grid gap-16 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-24">
            <div>
              <h2 className="mb-8 text-[2rem]">Technical specification</h2>
              <SpecTable
                rows={product.specs}
                downloadHref={docs[0] ? `/downloads?doc=${docs[0].slug}` : "/downloads"}
                caption={
                  product.cultureType
                    ? `${CULTURE_TYPE_LABELS[product.cultureType]} · Direct Vat Set`
                    : undefined
                }
              />
            </div>

            <aside>
              <h2 className="mb-6 text-[1.5rem]">
                Why this over an imported equivalent
              </h2>
              <ul className="flex flex-col gap-5 border-t border-ab-chill pt-6">
                {product.versusImported.map((point) => (
                  <li key={point} className="text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                    {point}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section-ab-tight border-t border-ab-chill bg-ab-white">
          <div className="container-ab">
            <h2 className="mb-8 text-[1.5rem]">Related products</h2>
            <ul className="grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug} className="bg-ab-white">
                  <Link
                    href={`/products/${p.category}/${p.slug}`}
                    className="group flex h-full flex-col gap-2 p-6 no-underline"
                  >
                    {p.strainCode ? <StrainCode code={p.strainCode} tone="muted" /> : null}
                    <span className="font-display text-[1.25rem] tracking-[-0.02em] text-ab-ink group-hover:text-ab-tank">
                      {p.name}
                    </span>
                    <span className="text-[0.875rem] text-ab-ink-60">{p.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CTABand
        title={`Trial ${product.name} on your own milk.`}
        body="Tell us your volumes and what you are targeting. We will send a sample and the parameters to run it against."
        href={quoteHref}
        cta="Request a sample"
      />
    </>
  );
}
