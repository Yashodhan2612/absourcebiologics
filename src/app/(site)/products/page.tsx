import Link from "next/link";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { StrainIndex } from "@/components/layout/StrainIndex";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChipLink } from "@/components/ui/Chip";
import { StrainCode } from "@/components/ui/StrainCode";
import { PackShot } from "@/components/ui/PackShot";
import { CTABand } from "@/components/sections/CTABand";
import {
  products,
  CATEGORY_LABELS,
  CULTURE_TYPE_LABELS,
} from "@/content/products";
import { solutions } from "@/content/solutions";

export const metadata = pageMetadata({
  title: "DVS cultures, dairy ingredients & taste makers | ABsource",
  description:
    "Twenty-one SKUs: 13 DVS starter culture lines, 7 dairy ingredients and a taste maker. Filter by application, culture type and category.",
  path: "/products",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Filterable catalogue.
 *
 * Filter state lives entirely in the URL (?category=cultures&app=cheese), so
 * a filtered view is shareable, linkable and indexable, and the whole page
 * stays a server component with no client-side filtering state. Each filter is
 * a plain <Link>, which means the catalogue works with JavaScript disabled.
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = one(params.category);
  const app = one(params.app);
  const type = one(params.type);

  const filtered = products.filter((p) => {
    if (category && p.category !== category) return false;
    if (app && !(p.applications as readonly string[]).includes(app)) return false;
    if (type && p.cultureType !== type) return false;
    return true;
  });

  const qs = (patch: Record<string, string | undefined>): string => {
    const next = new URLSearchParams();
    const merged = { category, app, type, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/products?${s}` : "/products";
  };

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow={`${products.length} SKUs`}
            title="The catalogue."
            lede="Thirteen DVS culture lines, seven dairy ingredients and a taste maker. Every culture carries a strain code."
          />
        </div>
      </section>

      <StrainIndex mode="sticky" />

      <section className="section-ab-tight">
        <div className="container-ab">
          {/* Filters. Each is a link, so filtering needs no JavaScript. */}
          <div className="flex flex-col gap-5">
            <FilterRow label="Category">
              <ChipLink href={qs({ category: undefined })} active={!category}>
                All
              </ChipLink>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <ChipLink
                  key={value}
                  href={qs({ category: value })}
                  active={category === value}
                >
                  {label}
                </ChipLink>
              ))}
            </FilterRow>

            <FilterRow label="Application">
              <ChipLink href={qs({ app: undefined })} active={!app}>
                All
              </ChipLink>
              {solutions.map((s) => (
                <ChipLink key={s.slug} href={qs({ app: s.slug })} active={app === s.slug}>
                  {s.name}
                </ChipLink>
              ))}
            </FilterRow>

            <FilterRow label="Culture type">
              <ChipLink href={qs({ type: undefined })} active={!type}>
                All
              </ChipLink>
              {Object.entries(CULTURE_TYPE_LABELS).map(([value, label]) => (
                <ChipLink key={value} href={qs({ type: value })} active={type === value}>
                  {label}
                </ChipLink>
              ))}
            </FilterRow>
          </div>

          <p className="mono-ab mt-10 text-ab-ink-60" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>

          {filtered.length === 0 ? (
            <div className="mt-8 border border-ab-chill bg-ab-white p-10">
              <p className="text-[1.25rem] text-ab-ink">
                Nothing matches that combination.
              </p>
              <p className="measure-ab mt-3 text-ab-ink-60">
                Clear a filter, or tell us what you are making and we will point you at
                the right culture.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/products" className="link-wipe mono-ab text-ab-tank no-underline">
                  Clear all filters &rarr;
                </Link>
                <Link href="/culture-selector" className="link-wipe mono-ab text-ab-tank no-underline">
                  Use the Culture Selector &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <ul className="mt-8 grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <li key={product.slug} className="bg-ab-white">
                  <Link
                    href={`/products/${product.category}/${product.slug}`}
                    className="group flex h-full flex-col no-underline"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <div className="absolute inset-0 transition-transform duration-150 ease-ab group-hover:scale-[1.02] motion-reduce:group-hover:scale-100">
                        <PackShot
                          src={product.image}
                          alt={`${product.name} pack`}
                          seed={product.strainCode ?? product.slug}
                          sizes="(min-width: 1024px) 33vw, 50vw"
                        />
                      </div>
                      {product.strainCode ? (
                        <div className="absolute left-4 top-4">
                          <StrainCode code={product.strainCode} />
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-6">
                      <h2 className="text-[1.25rem] text-ab-ink transition-colors duration-150 ease-ab group-hover:text-ab-tank">
                        {product.name}
                      </h2>
                      <p className="text-[0.9375rem] leading-[1.5] text-ab-ink-60">
                        {product.summary}
                      </p>
                      <span className="mono-ab mt-auto pt-4 text-ab-ink-60">
                        {CATEGORY_LABELS[product.category]}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CTABand
        title="Not sure which SKU to trial?"
        body="Answer eight questions and we will narrow the range to three, with the reasoning shown."
        href="/culture-selector"
        cta="Find your culture"
        secondaryHref="/request-a-quote"
        secondaryCta="Request a sample"
      />
    </>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6">
      <span className="mono-ab shrink-0 text-ab-ink-60 sm:w-28">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
