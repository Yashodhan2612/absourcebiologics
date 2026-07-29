import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "@/components/forms/ContactForm";
import { LazyMap } from "@/components/ui/LazyMap";
import { company } from "@/content/company";

export const metadata = pageMetadata({
  title: "Contact ABsource Biologics, Pune",
  description:
    "Kinetic Innovation Park, MIDC Chinchwad, Pune 411019. info@absourcebiologics.com. +91 91686 96640.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />

      <section className="section-ab-tight">
        <div className="container-ab">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-24">
            <div>
              <SectionHeading as="h1" eyebrow="Contact" title="Talk to a technologist." />

              <div className="mt-10 flex flex-col gap-8">
                <div>
                  <Eyebrow className="mb-3">Address</Eyebrow>
                  <address className="not-italic text-base leading-[1.7] text-ab-ink-60">
                    {company.legalName}
                    <br />
                    {company.address.line1}
                    <br />
                    {company.address.line2}
                    <br />
                    {company.address.city} &ndash; {company.address.postcode}
                    <br />
                    {company.address.country}
                  </address>
                </div>

                <div>
                  <Eyebrow className="mb-3">Email</Eyebrow>
                  <a
                    href={`mailto:${company.email}`}
                    className="link-wipe text-base text-ab-ink no-underline"
                  >
                    {company.email}
                  </a>
                </div>

                <div>
                  <Eyebrow className="mb-3">Phone</Eyebrow>
                  <ul className="flex flex-col gap-1">
                    {company.phones.map((phone) => (
                      <li key={phone}>
                        <a
                          href={`tel:${phone.replace(/\s/g, "")}`}
                          className="link-wipe text-base text-ab-ink no-underline"
                        >
                          {phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="max-w-2xl">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ab-chill">
        <LazyMap
          query="Kinetic Innovation Park, MIDC Chinchwad, Pune 411019"
          title="ABsource Biologics location map"
        />
      </section>
    </>
  );
}
