import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Photo } from "@/components/ui/Photo";
import { Stat } from "@/components/ui/Stat";
import { qualityClaims } from "@/content/certifications";
import { CertificateWall } from "@/components/sections/CertificateWall";
import { VendorAuditForm } from "@/components/forms/VendorAuditForm";
import { company } from "@/content/company";
import { stats } from "@/content/stats";

export const metadata = pageMetadata({
  title: "Quality & certification",
  description:
    "ISO 9001:2015, ISO 22000:2018, HACCP and HALAL. 24 quality checks, clean-room manufacturing and phage-resistant strains.",
  path: "/quality",
});

/**
 * The credibility page — written for an auditor as much as a buyer.
 *
 * Certificate numbers, issuing bodies and expiry dates are not published: they
 * were not supplied, and an auditor will want the certificate itself rather
 * than a number typed onto a web page. The documentation request routes that
 * to a human instead.
 */
export default function QualityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Quality", path: "/quality" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="Quality"
            title="Consistency is a process claim, not a promise."
            lede="Here is what stands behind it: the certifications, the checks, and what we do about the failure mode that costs a plant a full vat."
          />
          <div className="mt-14 flex flex-wrap gap-16">
            <Stat entry={stats.qualityChecks} label="Quality checks per batch" />
            <Stat entry={stats.culturesOffered} label="Cultures, DVS starter" />
            <Stat entry={stats.productLines} label="Product lines" />
            <Stat entry={stats.customersServed} label="Customers served" />
          </div>
        </div>
      </section>

      {/*
        The documents themselves, not a list of their names. The page used to
        print the four titles and then explain in a paragraph why the
        certificates were not shown; an auditor reading that assumes the worst.
        The licence leads because its number is checkable on a public register.
      */}
      <section className="section-ab-tight">
        <div className="container-ab">
          <SectionHeading
            eyebrow="Certification"
            title="What we hold, and the licence behind it."
            lede="The FSSAI licence number below is on the public register and can be checked without asking us. Certificates are supplied in full for vendor-approval files."
            className="mb-12 max-w-3xl"
          />
          <CertificateWall />
        </div>
      </section>

      <section className="section-ab-tight bg-ab-white">
        <div className="container-ab">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <SectionHeading
                eyebrow="In practice"
                title="What that means on the floor."
                className="mb-10"
              />
              <ul className="flex flex-col divide-y divide-ab-chill border-y border-ab-chill">
                {qualityClaims.map((claim) => (
                  <li key={claim.title} className="py-6">
                    <h3 className="text-[1.25rem] text-ab-ink">{claim.title}</h3>
                    <p className="measure-ab mt-2 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                      {claim.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Eyebrow className="mb-5">Phage resistance</Eyebrow>
              <h2 className="text-[1.75rem] leading-tight md:text-[2.25rem]">
                The failure mode that costs you a vat.
              </h2>
              <div className="measure-ab mt-6 flex flex-col gap-5 text-base leading-[1.65] text-ab-ink-60">
                <p>
                  Bacteriophage attack on a starter is the fermentation failure that does
                  not announce itself until the vat has not set. A propagated bulk starter
                  is particularly exposed, because the same organisms are being grown on
                  site, repeatedly, in an environment that accumulates phage.
                </p>
                <p>
                  Our strains are selected for phage resistance and supplied freeze-dried
                  as Direct Vat Set, so there is no on-site propagation step for phage to
                  colonise in the first place.
                </p>
              </div>
              <div className="relative mt-10 aspect-[16/9] overflow-hidden">
                <Photo
                  src="/assets/facility/qc-bench.webp"
                  alt="Technologists at the in-process QC bench, with microscope and laminar flow cabinets"
                  sizes="(min-width: 768px) 66vw, 100vw"
                  parallax
                  depth={0.5}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        The audit request is a FORM on this page, not a link to /contact.
        Someone running a vendor approval is already here reading the
        certifications; sending them to a general contact form loses both the
        context and the routing — this goes straight to QA.
      */}
      <section className="ab-reversed section-ab-tight bg-ab-tank">
        <div className="container-ab">
          <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,32rem)] lg:gap-20">
            <div>
              <SectionHeading
                tone="reversed"
                eyebrow="Vendor approval"
                title="Auditing us as a vendor?"
                lede="Tell us which documents your approval process needs and we will send the current set. This reaches our quality assurance team directly."
              />
              <p className="measure-ab mt-6 text-[0.9375rem] leading-[1.65] text-ab-tank-300">
                Or email{" "}
                <a
                  href={`mailto:${company.qaEmail}`}
                  className="link-wipe text-ab-ghee no-underline"
                >
                  {company.qaEmail}
                </a>{" "}
                if you would rather attach your questionnaire.
              </p>
            </div>
            <div className="border border-ab-milk/15 bg-ab-milk p-6 md:p-8">
              <VendorAuditForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
