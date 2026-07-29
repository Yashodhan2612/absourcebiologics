import type { Metadata } from "next";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ValueTable } from "@/components/sections/ValueTable";
import { ExportForm } from "@/components/forms/ExportForm";
import { certifications } from "@/content/certifications";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Export & distribution | ABsource Biologics",
    description:
      "Manufacturer-direct DVS starter cultures from India. HALAL certified, ISO 9001 and ISO 22000, with responsive custom development.",
    path: "/export",
  }),
  alternates: {
    canonical: "https://absourcebiologics.com/export",
    languages: { en: "https://absourcebiologics.com/export" },
  },
};

/**
 * Export.
 *
 * DELIBERATELY DIFFERENT COPY, not a translation of the domestic pages.
 *
 * The Atmanirbhar Bharat / Make in India frame is powerful for an Indian dairy
 * buyer and completely irrelevant to a distributor in Dubai or Dhaka. It is
 * banned on this page (Section 2, Section 13). The same underlying facts are
 * re-cut here as manufacturer-direct pricing, no European middleman margin,
 * HALAL certification and responsive custom development.
 *
 * ValueTable is rendered with audience="export", which swaps the Strategic row
 * for supply reliability — that substitution lives in the component so this
 * page cannot accidentally reintroduce the domestic framing.
 *
 * Named markets are NOT listed: the country count is unverified (see stats.ts)
 * and naming markets we cannot confirm would be inventing a claim.
 */
export default function ExportPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Export", path: "/export" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="Export & distribution"
            title="Buy your cultures from the people who make them."
            lede="ABsource manufactures DVS dairy starter cultures in Pune and supplies distributors and importers directly. No European middleman, no margin stacked between you and the fermentation lab."
          />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <div className="grid gap-14 lg:grid-cols-3 lg:gap-16">
            <div>
              <Eyebrow className="mb-4">Manufacturer-direct</Eyebrow>
              <p className="text-base leading-[1.65] text-ab-ink-60">
                You are dealing with the manufacturer, not a reseller. Pricing reflects
                that, and so does the speed of a technical answer &mdash; the person who
                can change a blend works in the same building as the person quoting you.
              </p>
            </div>
            <div>
              <Eyebrow className="mb-4">Certification</Eyebrow>
              <ul className="flex flex-col gap-2">
                {certifications.map((c) => (
                  <li key={c.slug} className="text-base text-ab-ink-60">
                    <span className="text-ab-ink">{c.name}</span> &mdash; {c.standard}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                HALAL certification is in place, which most Middle Eastern and several
                South-East Asian importers require.
              </p>
            </div>
            <div>
              <Eyebrow className="mb-4">Custom development</Eyebrow>
              <p className="text-base leading-[1.65] text-ab-ink-60">
                If your market wants a product the global catalogues do not serve, we can
                develop the blend for it. A distributor reselling an imported range cannot
                offer that, and it is usually the difference in a competitive tender.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-ab-tight bg-ab-white">
        <div className="container-ab">
          <SectionHeading
            eyebrow="Commercial terms"
            title="What to confirm before we quote."
            lede="Export quotations depend on your market. These are the variables we will need from you, and they are why an export quote takes longer than a domestic one."
            className="mb-12 max-w-3xl"
          />
          <ul className="grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Packaging & MOQ", b: "Pack sizes and minimum order quantity are set per product and per destination." },
              { t: "Cold chain", b: "Storage and shipping conditions are confirmed against your route and transit time." },
              { t: "Documentation", b: "Certificates of analysis, certificates of origin and HALAL documentation as your customs process requires." },
              { t: "Regulatory registration", b: "Where your market requires local product registration, we can support the submission." },
            ].map((item) => (
              <li key={item.t} className="bg-ab-white p-6">
                <h3 className="text-[1.25rem] text-ab-ink">{item.t}</h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.55] text-ab-ink-60">{item.b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <SectionHeading
            eyebrow="The value"
            title="What you get from a manufacturer-direct supply."
            className="mb-12 max-w-3xl"
          />
          <ValueTable audience="export" />
        </div>
      </section>

      <section className="section-ab-tight border-t border-ab-chill bg-ab-chill/40">
        <div className="container-ab">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-24">
            <div>
              <SectionHeading eyebrow="Enquiry" title="Tell us about your market." />
            </div>
            <div className="max-w-2xl">
              <ExportForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
