import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CareersForm } from "@/components/forms/CareersForm";
import { vision } from "@/content/company";

export const metadata = pageMetadata({
  title: "Careers | ABsource Biologics, Pune",
  description:
    "Microbiologists, biotechnologists and dairy technologists. We build cultures that did not exist in India before 2016.",
  path: "/careers",
});

/**
 * Careers.
 *
 * No roles are listed because none were supplied, and inventing a vacancy
 * would waste a candidate's time. The open application is the honest version,
 * and it still captures the lead. See CONTENT-TODO.md.
 */
const openRoles: readonly { title: string; location: string; summary: string }[] = [];

export default function CareersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Careers", path: "/careers" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="Careers"
            title="Work on cultures that did not exist here ten years ago."
            lede={vision.body}
          />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <Eyebrow className="mb-5">What it is like</Eyebrow>
              <div className="measure-ab flex flex-col gap-5 text-base leading-[1.65] text-ab-ink-60">
                <p>
                  ABsource is a company of scientists and dairy technologists. Microbiology,
                  biotechnology and dairy technology sit in the same building as
                  manufacturing, so development work reaches production quickly and
                  production problems reach development quickly.
                </p>
                <p>
                  The interesting work is custom development: a customer arrives with a
                  product that does not exist yet, and the job is to build the culture that
                  makes it possible.
                </p>
              </div>

              {openRoles.length > 0 ? (
                <div className="mt-10">
                  <Eyebrow className="mb-5">Open roles</Eyebrow>
                  <ul className="divide-y divide-ab-chill border-y border-ab-chill">
                    {openRoles.map((role) => (
                      <li key={role.title} className="py-5">
                        <h2 className="text-[1.25rem] text-ab-ink">{role.title}</h2>
                        <p className="mono-ab mt-1 text-ab-ink-60">{role.location}</p>
                        <p className="measure-ab mt-2 text-[0.9375rem] text-ab-ink-60">
                          {role.summary}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-10 border border-ab-chill bg-ab-white p-6 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                  We are not advertising a specific vacancy at the moment. We do read open
                  applications from microbiologists, biotechnologists and dairy
                  technologists, so send one if the work sounds like yours.
                </p>
              )}
            </div>

            <div className="max-w-2xl">
              <Eyebrow className="mb-5">Apply</Eyebrow>
              <CareersForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
