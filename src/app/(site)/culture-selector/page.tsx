import { Suspense } from "react";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SelectorWizard } from "@/components/selector/SelectorWizard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cultures } from "@/content/products";

export const metadata = pageMetadata({
  title: "Culture Selector — find your DVS starter | ABsource",
  description:
    "Answer eight questions and we narrow thirteen DVS culture lines to three, with the reasoning shown. No login, no gate on the result.",
  path: "/culture-selector",
});

/**
 * The Culture Selector page.
 *
 * The wizard itself is a client component because its state lives in URL
 * params, but the thirteen culture lines are rendered server-side below it so
 * that every SKU name and strain code is in the crawlable HTML regardless of
 * how far into the wizard a visitor gets.
 */
export default function CultureSelectorPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Culture Selector", path: "/culture-selector" },
        ]}
      />

      <section className="section-ab-tight">
        <div className="container-ab">
          <div className="mb-14 max-w-3xl">
            <Eyebrow className="mb-5">Culture Selector</Eyebrow>
            <h1 className="text-[2.75rem] leading-[0.95] tracking-[-0.03em] md:text-[3.75rem]">
              Find your culture.
            </h1>
            <p className="measure-ab mt-6 text-[1.25rem] leading-[1.5] text-ab-ink-60">
              Eight questions, under a minute. We show the reasoning behind every match,
              and we tell you when we are not confident enough to recommend anything.
            </p>
          </div>

          <div className="max-w-4xl">
            <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
              <SelectorWizard />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Server-rendered so the whole range is indexable from this page. */}
      <section className="border-t border-ab-chill py-16">
        <div className="container-ab">
          <h2 className="mono-ab mb-6 text-ab-ink-60">
            The thirteen DVS culture lines
          </h2>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {cultures.map((culture) => (
              <li key={culture.slug} className="text-[0.9375rem] text-ab-ink-60">
                <span className="mono-ab text-ab-tank">{culture.strainCode}</span>{" "}
                {culture.name} &middot; {culture.summary}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
