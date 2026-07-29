import { notFound } from "next/navigation";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { news, newsBySlug } from "@/content/news";

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = newsBySlug(slug);
  if (!item) return {};
  return pageMetadata({
    title: item.title.slice(0, 60),
    description: item.summary.slice(0, 155),
    path: `/news/${slug}`,
  });
}

export default async function NewsItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = newsBySlug(slug);
  if (!item) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "News & events", path: "/news" },
          { name: item.title, path: `/news/${slug}` },
        ]}
      />
      <article className="section-ab-tight">
        <div className="container-ab max-w-3xl">
          <Eyebrow className="mb-5">
            <time dateTime={item.date}>
              {new Date(item.date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {item.location ? ` · ${item.location}` : ""}
          </Eyebrow>
          <h1 className="text-[2.75rem] leading-[0.95] tracking-[-0.03em] md:text-[3.75rem]">
            {item.title}
          </h1>
          <div className="mt-10 flex flex-col gap-6">
            {item.body.map((para) => (
              <p key={para} className="text-base leading-[1.7] text-ab-ink-60">
                {para}
              </p>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
