import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Photo } from "@/components/ui/Photo";
import { CTABand } from "@/components/sections/CTABand";
import { leadership } from "@/content/leadership";

export const metadata = pageMetadata({
  title: "Leadership | ABsource Biologics",
  description:
    "Founded by Dr. Mukesh Vinze, a biochemist, and Mr. Jagannath Sonavane, a biotechnologist. The science sits inside the company.",
  path: "/about/leadership",
});

export default function LeadershipPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
          { name: "Leadership", path: "/about/leadership" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="Leadership"
            title="A scientist and a biotechnologist."
            lede="ABsource is science-led rather than sales-led because of who founded it. That is the whole argument, and it is visible in how the company answers a technical question."
          />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <ul className="flex flex-col gap-20">
            {leadership.map((leader, i) => (
              <li
                key={leader.slug}
                className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-20"
              >
                <div
                  className={`relative aspect-[4/5] overflow-hidden border border-ab-chill ${
                    i % 2 === 1 ? "lg:order-2" : ""
                  }`}
                >
                  <Photo
                    src={`/assets/team/${leader.slug}.webp`}
                    alt={`${leader.name}, ${leader.role}`}
                    sizes="(min-width: 1024px) 22rem, 100vw"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <Eyebrow className="mb-4">{leader.role}</Eyebrow>
                  <h2 className="text-[2rem] leading-tight md:text-[2.75rem]">
                    {leader.name}
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                    {leader.qualifications.map((q) => (
                      <li key={q} className="mono-ab text-ab-ink-60">
                        {q}
                      </li>
                    ))}
                  </ul>
                  <p className="measure-ab mt-6 text-base leading-[1.65] text-ab-ink-60">
                    {leader.bio}
                  </p>
                  <div className="mt-8">
                    <Eyebrow className="mb-3">Previously</Eyebrow>
                    <ul className="flex flex-col gap-1.5">
                      {leader.previously.map((p) => (
                        <li key={p} className="text-[0.9375rem] text-ab-ink-60">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand
        title="Ask a technical question and a technologist answers it."
        body="Not a sales rep reading from a catalogue."
        href="/contact"
        cta="Talk to a technologist"
      />
    </>
  );
}
