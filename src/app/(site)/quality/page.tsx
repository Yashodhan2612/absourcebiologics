import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Photo } from "@/components/ui/Photo";
import { CTABand } from "@/components/sections/CTABand";
import { Stat } from "@/components/ui/Stat";
import { certifications, qualityClaims } from "@/content/certifications";
import { stats } from "@/content/stats";

export const metadata = pageMetadata({
  title: "Quality & certification | ABsource Biologics",
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
            <Stat entry={stats.cultureLines} label="DVS culture lines" />
            <Stat entry={stats.customersServed} label="Customers served" />
          </div>
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <SectionHeading eyebrow="Certification" title="What we hold." className="mb-12 max-w-3xl" />
          <ul className="grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-2">
            {certifications.map((cert) => (
              <li key={cert.slug} className="bg-ab-white p-8">
                <h2 className="font-display text-[1.75rem] tracking-[-0.02em] text-ab-tank">
                  {cert.name}
                </h2>
                <p className="mono-ab mt-2 text-ab-ink-60">{cert.standard}</p>
                <p className="measure-ab mt-5 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                  {cert.what}
                </p>
              </li>
            ))}
          </ul>
          <p className="measure-ab mt-8 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
            Certificates are supplied directly for vendor-approval and audit files rather
            than published here, so you receive the current document with its issuing body
            and validity rather than a screenshot.
          </p>
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
                  src="/assets/facility/fermentation.webp"
                  alt="Stainless-steel fermentation vessels in the production area"
                  sizes="(min-width: 768px) 66vw, 100vw"
                  parallax
                  depth={0.5}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABand
        title="Auditing us as a vendor?"
        body="Tell us which documents your approval process needs and we will send the current set."
        href="/contact"
        cta="Request documentation"
      />
    </>
  );
}
