import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ClientWall } from "@/components/sections/ClientWall";
import { CTABand } from "@/components/sections/CTABand";
import { CaseStudy, type CaseStudyData } from "@/components/sections/CaseStudy";

export const metadata = pageMetadata({
  title: "Customers | ABsource Biologics",
  description:
    "300+ dairy customers across India and export markets, supplied with indigenous DVS starter cultures from Pune since 2016.",
  path: "/customers",
});

/**
 * Customers.
 *
 * The CaseStudy component is built and typed, and ships with zero case
 * studies. Not one is invented: a fabricated result attributed to a real dairy
 * is the single fastest way to lose a technical buyer's trust, and there is no
 * source for one. Add entries to `caseStudies` and the section appears.
 * See CONTENT-TODO.md.
 */
const caseStudies: readonly CaseStudyData[] = [];

export default function CustomersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Customers", path: "/customers" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="Customers"
            title="Who we supply."
            lede="From large cooperative dairies to single-product startups, across India and export markets."
          />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <ClientWall />
        </div>
      </section>

      {caseStudies.length > 0 ? (
        <section className="section-ab-tight bg-ab-white">
          <div className="container-ab">
            <SectionHeading eyebrow="Case studies" title="What changed." className="mb-12" />
            <ul className="flex flex-col gap-12">
              {caseStudies.map((study) => (
                <li key={study.slug}>
                  <CaseStudy study={study} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CTABand
        title="Trial us against your current culture."
        body="The honest way to evaluate a supplier is a trial batch on your own milk, against your existing control."
        cta="Request a sample"
      />
    </>
  );
}
