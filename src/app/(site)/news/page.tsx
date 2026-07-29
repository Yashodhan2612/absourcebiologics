import Link from "next/link";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTABand } from "@/components/sections/CTABand";
import { news } from "@/content/news";

export const metadata = pageMetadata({
  title: "News & events | ABsource Biologics",
  description:
    "Exhibitions, events and technical notes from ABsource Biologics, Pune.",
  path: "/news",
});

export default function NewsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "News & events", path: "/news" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="News & events"
            title="Where we are, and what we're working on."
          />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          {news.length === 0 ? (
            // Honest empty state. The live site's exhibition history could not
            // be retrieved, and inventing an event ABsource did not attend
            // would be a fabricated claim. See CONTENT-TODO.md.
            <div className="max-w-2xl border border-ab-chill bg-ab-white p-10">
              <h2 className="text-[1.5rem] text-ab-ink">Nothing published here yet.</h2>
              <p className="measure-ab mt-3 text-ab-ink-60">
                We exhibit at Indian dairy and food-ingredient trade shows through the
                year. If you would like to know where we will be next, ask and we will
                tell you.
              </p>
              <Link
                href="/contact"
                className="link-wipe mono-ab mt-6 inline-block text-ab-tank no-underline"
              >
                Ask where we&rsquo;ll be next &rarr;
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ab-chill border-y border-ab-chill">
              {news.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/news/${item.slug}`}
                    className="group grid gap-3 py-8 no-underline md:grid-cols-[10rem_1fr] md:gap-10"
                  >
                    <time dateTime={item.date} className="mono-ab text-ab-ink-60">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <div>
                      <h2 className="font-display text-[1.5rem] tracking-[-0.02em] text-ab-ink group-hover:text-ab-tank">
                        {item.title}
                      </h2>
                      <p className="measure-ab mt-2 text-[0.9375rem] text-ab-ink-60">
                        {item.summary}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CTABand
        title="Meeting us at a show?"
        body="Tell us what you are making and we will bring something relevant rather than a generic sample kit."
        cta="Request a sample"
      />
    </>
  );
}
