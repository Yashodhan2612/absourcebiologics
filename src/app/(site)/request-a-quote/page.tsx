import { Suspense } from "react";
import { pageMetadata } from "@/lib/seo";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = pageMetadata({
  title: "Request a quote or a sample | ABsource Biologics",
  description:
    "Tell us what you are making, the texture and acidity you are targeting and your volumes. A technologist replies with a recommendation and a sample.",
  path: "/request-a-quote",
});

export default function RequestAQuotePage() {
  return (
    <section className="section-ab-tight">
      <div className="container-ab">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-24">
          <div>
            <SectionHeading
              as="h1"
              eyebrow="Request a quote"
              title="Send us your spec."
              lede="Three short steps. We ask what you are making first and who you are last — you should not have to hand over a phone number before you know we can help."
            />
            <p className="measure-ab mt-8 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
              A technologist reads every enquiry. If the answer is that nothing in the
              range fits, we will tell you that rather than sell you the nearest thing.
            </p>
          </div>

          <div className="max-w-2xl">
            <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
              <QuoteForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
