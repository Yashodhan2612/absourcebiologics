import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CareersForm } from "@/components/forms/CareersForm";
import { company, vision } from "@/content/company";

export const metadata = pageMetadata({
  title: "Careers in Pune",
  description:
    "Microbiologists, biotechnologists and dairy technologists. Send an open application to hr@absourcebiologics.com.",
  path: "/careers",
});

/**
 * Careers.
 *
 * CUT TO ONE LINE at the client's request. This page used to carry a
 * "what it is like" essay, an empty open-roles list and an explanation of why
 * that list was empty — three blocks of copy around one instruction. The
 * instruction is the page.
 *
 * No roles are listed because none were supplied, and inventing a vacancy
 * would waste a candidate's time.
 *
 * The form and the address do the same job on purpose: the form is the fast
 * path and reaches HR with structured fields, the address is for people who
 * would rather just attach a CV and send it. Both land in the same inbox.
 */
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
          <div className="grid gap-14 lg:grid-cols-[1fr_minmax(0,32rem)] lg:gap-24">
            <div>
              {/* The single line. Everything the client asked this page to
                  say, said once. */}
              <p className="measure-ab text-[1.375rem] leading-[1.45] text-ab-ink md:text-[1.75rem]">
                Interested candidates can email their resume to{" "}
                <a
                  href={`mailto:${company.hrEmail}`}
                  className="link-wipe text-ab-tank no-underline"
                >
                  {company.hrEmail}
                </a>
                .
              </p>
              <p className="measure-ab mt-6 text-base leading-[1.65] text-ab-ink-60">
                We are not advertising a specific vacancy at the moment, and we do
                read open applications from microbiologists, biotechnologists and
                dairy technologists.
              </p>
            </div>

            <div>
              <Eyebrow className="mb-5">Or apply here</Eyebrow>
              <CareersForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
