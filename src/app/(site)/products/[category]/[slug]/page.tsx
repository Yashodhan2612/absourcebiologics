import { notFound } from "next/navigation";
import Link from "next/link";
import { pageMetadata, ProductJsonLd, BreadcrumbJsonLd } from "@/lib/seo";
import { ProductCode } from "@/components/ui/ProductCode";
import { ChipLink } from "@/components/ui/Chip";
import Image from "next/image";
import { SachetMount } from "@/components/webgl/SachetMount";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { SpecTable } from "@/components/sections/SpecTable";
import { CTABand } from "@/components/sections/CTABand";
import {
  products,
  productBySlug,
  packArtworkNote,
  CATEGORY_COPY,
  CATEGORY_LABELS,
  CULTURE_TYPE_LABELS,
} from "@/content/products";
import { families, styleLabel, variantsForProduct } from "@/content/variants";
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

  /** The coded variants ordered against this product. Empty for ingredients. */
  const lineVariants = variantsForProduct(product.slug);

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

  /**
   * A pilot product exists but cannot yet be ordered, sampled or specified.
   * Everything below that would otherwise offer one of those keys off this, so
   * the page never invites a request nobody can fulfil.
   */
  const isPilot = product.availability === "pilot";
  /** A photograph of the product's own pack, not the catalogue artwork. */
  const isOwnPack = product.imageKind === "photo";
  /**
   * The 3D sachet and the colour-coding note both belong to the flat catalogue
   * artwork that culture sachets are shown in. AB704 sits in its own category
   * but is shown in ABCREAM's sachet, so it qualifies too — hence `packOf`
   * rather than a category test.
   */
  const isCatalogueArtwork =
    Boolean(product.image) &&
    !isOwnPack &&
    (product.category === "cultures" || Boolean(product.packOf));
  const substrate = product.substrate ?? "milk";

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
            <div>
              <div className="relative aspect-[4/5] overflow-hidden border border-ab-chill">
                <SachetMount
                  image={product.image}
                  name={product.name}
                  slug={product.slug}
                  strainCode={product.strainCode ?? undefined}
                  category={isCatalogueArtwork ? "cultures" : product.category}
                  flat={!isCatalogueArtwork}
                />
              </div>

              {/* The most important placement of this note on the site: it sits
                  directly under the image that misleads, and at tier 3 that
                  well holds a turnable 3D model, which reads even more
                  strongly as "this is what arrives". Cultures only — the
                  ingredient packs ARE the delivery pack — and only where pack
                  artwork actually exists, or it captions the abstract colony
                  plate that stands in for a missing image. */}
              {isCatalogueArtwork ? (
                <p className="measure-ab mt-3 border-t border-ab-chill pt-3 text-[0.875rem] leading-[1.55] text-ab-ink-60">
                  {packArtworkNote.detail}
                </p>
              ) : null}

              {/*
                The printed reverse of the pack. It carries the storage
                temperature, shelf life, manufacturing address and the FSSAI
                licence number, which is exactly what a buyer turns a pack over
                to read — so it is shown, not just the front.

                No pack-artwork note here or above: that caption says the
                colour is illustrative and the delivered pack is the standard
                blue and white sachet, which is true of the catalogue artwork
                and not of a product photographed in its own pack.
              */}
              {product.imageBack ? (
                <figure className="mt-6">
                  {/* A thumbnail cannot carry the storage temperature and the
                      licence number at 16rem, so it opens full size. Plain
                      anchor to the file: no lightbox to build, focus or trap. */}
                  <a
                    href={product.imageBack}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block aspect-[945/1300] w-full max-w-[16rem] overflow-hidden border border-ab-chill bg-ab-chill/35"
                  >
                    <Image
                      src={product.imageBack}
                      alt={`Reverse of the ${product.name} pack, showing storage, shelf life and manufacturer details`}
                      fill
                      sizes="16rem"
                      className="object-contain"
                    />
                    <span className="sr-only"> — opens full size in a new tab</span>
                  </a>
                  <figcaption className="mono-ab mt-2 text-[0.8125rem] text-ab-ink-60">
                    Reverse of the pack &middot; select to enlarge
                  </figcaption>
                </figure>
              ) : null}
            </div>

            <div className="flex flex-col justify-center">
              <div className="mb-6 flex items-center gap-3">
                {product.strainCode ? <ProductCode code={product.strainCode} /> : null}
                <Eyebrow>{CATEGORY_COPY[product.category]?.item ?? product.category}</Eyebrow>
                {isPilot ? (
                  // Loud enough to be seen before the description is read.
                  <span className="mono-ab border border-ab-ghee-dark px-1.5 py-0.5 leading-none text-ab-ink">
                    New · in pilot
                  </span>
                ) : null}
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
                  {isPilot ? "Register your interest" : "Request a sample"}
                </ButtonLink>
                {docs[0] ? (
                  <ButtonLink
                    href={`/downloads?doc=${docs[0].slug}`}
                    variant="secondary"
                    size="lg"
                  >
                    Request the data sheet
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
              <h2 className="mb-8 text-[2rem]">
                {isPilot ? "Availability" : "Technical specification"}
              </h2>
              {isPilot ? (
                // No table, and no "available on the data sheet" list: that
                // list is a promise of a document, and there is no document.
                <div className="border border-ab-chill bg-ab-white p-6 md:p-8">
                  <p className="text-[1.0625rem] leading-[1.5] text-ab-ink">
                    {product.name} is in early testing and in pilot with select
                    customers. It will launch and be available soon.
                  </p>
                  <p className="measure-ab mt-4 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                    The specification will be published at launch. If you would
                    like to hear when it is available, register your interest and
                    we will get in touch.
                  </p>
                </div>
              ) : (
                <SpecTable
                  rows={product.specs}
                  downloadHref={docs[0] ? `/downloads?doc=${docs[0].slug}` : "/downloads"}
                  caption={
                    product.cultureType
                      ? `${CULTURE_TYPE_LABELS[product.cultureType]} · Direct Vat Set`
                      : undefined
                  }
                />
              )}
            </div>

            {product.versusImported.length > 0 ? (
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
            ) : null}
          </div>
        </div>
      </section>

      {/*
        The coded variants of this product.

        A variant is a sub-category of a product, so this is the one place the
        codes belong on a product page: after the specification, where a
        technologist is deciding which one to trial. The catalogue grid at
        /products deliberately does NOT show them — that page lists products.
        Renders nothing for ingredients and for a line still in pilot.
      */}
      {lineVariants.length > 0 ? (
        <section className="section-ab-tight border-t border-ab-chill bg-ab-white">
          <div className="container-ab">
            <h2 className="mb-3 text-[2rem]">
              {lineVariants.length === 1 ? "The variant in this line" : "Variants in this line"}
            </h2>
            <p className="measure-ab mb-10 text-base leading-[1.65] text-ab-ink-60">
              {lineVariants.length === 1
                ? `${product.name} is supplied as one coded culture.`
                : `${product.name} is supplied as ${lineVariants.length} coded cultures.`}{" "}
              Quote the code with your order, or tell us what you are making and
              the{" "}
              <Link href="/culture-selector" className="link-wipe text-ab-tank no-underline">
                Culture Selector
              </Link>{" "}
              will suggest one.
            </p>

            <ul
              className={
                // One variant reads as a single full-width row, not as half of
                // a two-column grid with nothing beside it.
                lineVariants.length === 1
                  ? "grid border border-ab-chill"
                  : "grid gap-px border border-ab-chill bg-ab-chill md:grid-cols-2"
              }
            >
              {lineVariants.map((variant) => (
                <li key={variant.code} className="bg-ab-white p-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <ProductCode code={variant.code} />
                    {variant.style?.length ? (
                      <span className="mono-ab text-ab-ink-60">
                        {variant.style
                          .map((style) => styleLabel(variant.family, style))
                          .join(" · ")}
                      </span>
                    ) : families[variant.family].productSlug !== product.slug ? (
                      // Cross-listed from another family: say which.
                      <span className="mono-ab text-ab-ink-60">
                        {families[variant.family].label}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                    {variant.descriptor}
                  </p>
                </li>
              ))}
              {/* Fill an odd last row so the hairline ground does not show as
                  an empty tinted cell. */}
              {lineVariants.length > 1 && lineVariants.length % 2 === 1 ? (
                <li aria-hidden="true" className="hidden bg-ab-white md:block" />
              ) : null}
            </ul>
          </div>
        </section>
      ) : null}

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
                    {p.strainCode ? <ProductCode code={p.strainCode} tone="muted" /> : null}
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
        title={
          isPilot
            ? `${product.name} is coming soon.`
            : `Trial ${product.name} on your own ${substrate}.`
        }
        body={
          isPilot
            ? "It is in pilot with select customers now. Tell us what you would use it for and we will be in touch when it is available."
            : "Tell us your volumes and what you are targeting. We will send a sample and the parameters to run it against."
        }
        href={quoteHref}
        cta={isPilot ? "Register your interest" : "Request a sample"}
      />
    </>
  );
}
