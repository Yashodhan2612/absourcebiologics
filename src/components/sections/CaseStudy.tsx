import { StrainCode } from "@/components/ui/StrainCode";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Case study structure, ready for content.
 *
 * Built and typed but shipped with zero entries — see the note in
 * customers/page.tsx. Every field below must come from the customer, with
 * their approval to publish it. `result` in particular must be a measured
 * outcome the customer will stand behind, not a paraphrase.
 */
export type CaseStudyData = {
  readonly slug: string;
  /** Only if the customer has approved being named. Otherwise describe them. */
  readonly customer: string;
  readonly application: string;
  readonly challenge: string;
  readonly approach: string;
  readonly result: string;
  readonly skus: readonly { name: string; strainCode: string | null }[];
  readonly quote?: { readonly text: string; readonly attribution: string };
};

export function CaseStudy({ study }: { study: CaseStudyData }) {
  return (
    <article className="grid gap-10 border border-ab-chill bg-ab-white p-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16 lg:p-12">
      <div>
        <Eyebrow className="mb-3">{study.application}</Eyebrow>
        <h3 className="text-[1.75rem] leading-tight">{study.customer}</h3>
        <ul className="mt-6 flex flex-wrap gap-2">
          {study.skus.map((sku) => (
            <li key={sku.name}>
              {sku.strainCode ? (
                <StrainCode code={sku.strainCode} tone="muted" />
              ) : (
                <span className="mono-ab text-ab-ink-60">{sku.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-6">
        <Field label="Challenge" value={study.challenge} />
        <Field label="Approach" value={study.approach} />
        <Field label="Result" value={study.result} />
        {study.quote ? (
          <blockquote className="border-l-2 border-ab-tank pl-5">
            <p className="text-[1.25rem] leading-[1.5] text-ab-ink">
              &ldquo;{study.quote.text}&rdquo;
            </p>
            <footer className="mono-ab mt-3 text-ab-ink-60">
              {study.quote.attribution}
            </footer>
          </blockquote>
        ) : null}
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Eyebrow className="mb-2">{label}</Eyebrow>
      <p className="measure-ab text-base leading-[1.65] text-ab-ink-60">{value}</p>
    </div>
  );
}
