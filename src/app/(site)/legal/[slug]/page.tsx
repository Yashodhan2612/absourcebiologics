import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { legalPages, legalBySlug } from "@/content/legal";

export function generateStaticParams() {
  return legalPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalBySlug(slug);
  if (!page) return {};
  return pageMetadata({
    title: `${page.title} | ABsource Biologics`,
    description: `${page.title} for absourcebiologics.com.`,
    path: `/legal/${slug}`,
    noIndex: true,
  });
}

export default async function LegalPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = legalBySlug(slug);
  if (!page) notFound();

  return (
    <article className="section-ab-tight">
      <div className="container-ab max-w-3xl">
        <Eyebrow className="mb-5">
          Last updated{" "}
          <time dateTime={page.updated}>
            {new Date(page.updated).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </Eyebrow>
        <h1 className="text-[2.75rem] leading-[0.95] tracking-[-0.03em]">{page.title}</h1>

        <div className="mt-12 flex flex-col gap-10">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-[1.5rem] text-ab-ink">{section.heading}</h2>
              <div className="mt-4 flex flex-col gap-4">
                {section.body.map((para) => (
                  <p key={para} className="text-base leading-[1.7] text-ab-ink-60">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
