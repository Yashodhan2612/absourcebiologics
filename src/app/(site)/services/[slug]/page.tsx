import { notFound } from "next/navigation";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactForm } from "@/components/forms/ContactForm";
import { services, serviceBySlug } from "@/content/services";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return {};
  return pageMetadata({
    title: `${service.name} | ABsource Biologics`.slice(0, 60),
    description: service.summary.slice(0, 155),
    path: `/services/${slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${slug}` },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading as="h1" eyebrow="Service" title={service.name} lede={service.summary} />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <Eyebrow className="mb-5">Who it&rsquo;s for</Eyebrow>
              <p className="measure-ab text-[1.25rem] leading-[1.5] text-ab-ink-60">
                {service.forWhom}
              </p>
            </div>
            <div>
              <Eyebrow className="mb-5">What&rsquo;s included</Eyebrow>
              <ul className="flex flex-col divide-y divide-ab-chill border-y border-ab-chill">
                {service.includes.map((item) => (
                  <li key={item} className="py-4 text-base leading-[1.6] text-ab-ink-60">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Engagement genuinely is a sequence here, so numbered steps are the
          correct treatment — unlike the challenge/response rows, which are
          parallel and are deliberately not numbered. */}
      <section className="section-ab-tight bg-ab-white">
        <div className="container-ab">
          <SectionHeading eyebrow="How it works" title="The engagement." className="mb-12 max-w-2xl" />
          <ol className="grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-2 lg:grid-cols-3">
            {service.process.map((step, i) => (
              <li key={step.step} className="bg-ab-white p-8">
                <span className="mono-ab text-ab-tank">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-[1.25rem] text-ab-ink">{step.step}</h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.55] text-ab-ink-60">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-ab-tight border-t border-ab-chill bg-ab-chill/40">
        <div className="container-ab">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-24">
            <SectionHeading eyebrow="Enquiry" title={`Start a ${service.name.toLowerCase()} conversation.`} />
            <div className="max-w-2xl">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
