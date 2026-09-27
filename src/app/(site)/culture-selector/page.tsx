import { Suspense } from "react";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SelectorWizard } from "@/components/selector/SelectorWizard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CultureLines } from "@/components/selector/CultureLines";

export const metadata = pageMetadata({
  title: "Culture Selector — find your DVS starter",
  description:
    "Answer a few questions and we narrow the DVS culture range to three, with the reasoning shown. No login, no gate on the result.",
  path: "/culture-selector",
});

/**
 * The Culture Selector page.
 *
 * The wizard itself is a client component because its state lives in URL
 * params, but the culture lines are rendered server-side below it so
 * that every SKU name and product code is in the crawlable HTML regardless of
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
              A few questions, under a minute. We show the reasoning behind every match,
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

      {/*
        The culture catalogue. Every panel is in the server-rendered HTML and
        hidden with `hidden` rather than unmounted, so every code is indexable
        and findable with find-in-page whichever tab is open.
      */}
      <section className="border-t border-ab-chill py-16">
        <div className="container-ab">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-[1.75rem] leading-[1.1] tracking-[-0.02em] md:text-[2.25rem]">
              The DVS culture lines
            </h2>
            <p className="measure-ab mt-4 text-base leading-[1.65] text-ab-ink-60">
              Each product line covers several coded cultures, separated by how
              the curd sets and how sour it finishes. These are the codes to
              quote on an order.
            </p>
          </div>
          <CultureLines />
        </div>
      </section>
    </>
  );
}
