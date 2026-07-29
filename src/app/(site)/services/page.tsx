import Link from "next/link";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTABand } from "@/components/sections/CTABand";
import { services } from "@/content/services";

export const metadata = pageMetadata({
  title: "Services | Custom cultures, plant setup, testing",
  description:
    "Custom culture development, turnkey dairy plant setup and microbiology testing — the work around the culture.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]}
      />
      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="Services"
            title="The work around the culture."
            lede="A client can arrive with an idea and get culture development, plant setup and product safety testing from one company."
          />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <ul className="divide-y divide-ab-chill border-y border-ab-chill">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group grid gap-4 py-10 no-underline md:grid-cols-[minmax(0,22rem)_1fr] md:gap-16"
                >
                  <h2 className="font-display text-[1.75rem] leading-tight tracking-[-0.02em] text-ab-ink transition-colors duration-150 ease-ab group-hover:text-ab-tank md:text-[2.25rem]">
                    {service.name}
                  </h2>
                  <div>
                    <p className="measure-ab text-base leading-[1.65] text-ab-ink-60">
                      {service.summary}
                    </p>
                    <span className="mono-ab mt-5 inline-block text-ab-tank">
                      What&rsquo;s included &rarr;
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand
        title="Start with the problem, not the product."
        body="Describe what you are trying to make and we will tell you which of these you actually need."
        href="/contact"
        cta="Talk to a technologist"
      />
    </>
  );
}
