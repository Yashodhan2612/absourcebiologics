"use client";

import { useRouter } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/cn";

/**
 * Culture Selector teaser (Section 8, homepage section 7).
 *
 * This is the live first question of the wizard, not a banner about it.
 * Answering here deep-links straight into /culture-selector with the answer
 * pre-filled and the wizard already on step 2 — the buyer never repeats
 * themselves. Selector state lives in URL params throughout, which is what
 * makes this possible.
 *
 * Rendered as a real radiogroup: each option is a <button> inside a labelled
 * group, so it is keyboard operable and announced correctly.
 *
 * The grid is a hairline grid, so the last option spans whatever is left of
 * its row — a short row would otherwise show as a painted empty cell.
 *
 * `options` is passed in by the (server) page rather than imported here. The
 * list comes from src/lib/selector.ts, which pulls in the whole variant
 * catalogue; importing it into this client component would ship all of that
 * to the homepage for the sake of fourteen labels.
 */
const BASE_SPAN = ["", "col-span-2"] as const;
const SM_SPAN = ["sm:col-span-1", "sm:col-span-3", "sm:col-span-2"] as const;

export function SelectorTeaser({
  options,
}: {
  options: readonly { readonly value: string; readonly label: string }[];
}) {
  const router = useRouter();
  const lastCellSpan = cn(BASE_SPAN[options.length % 2], SM_SPAN[options.length % 3]);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
      <div>
        <Eyebrow className="mb-5">Culture Selector</Eyebrow>
        <h2 className="text-[2rem] leading-[0.98] tracking-[-0.03em] text-ab-ink md:text-[2.75rem]">
          Tell us what you make and we&rsquo;ll name the cultures to trial.
        </h2>
        <p className="measure-ab mt-6 text-base leading-[1.6] text-ab-ink-60">
          It asks only what matters for your product &mdash; several questions for curd,
          one for cheese &mdash; and it tells you when it is not confident enough to
          recommend anything.
        </p>
      </div>

      <div>
        <fieldset>
          <legend className="mono-ab mb-5 text-ab-ink-60">
            What are you making?
          </legend>
          <div className="grid grid-cols-2 gap-px border border-ab-chill bg-ab-chill sm:grid-cols-3">
            {options.map((option, i) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  router.push(`/culture-selector?making=${option.value}&step=2`)
                }
                className={cn(
                  "bg-ab-white px-4 py-5 text-left text-[0.9375rem] text-ab-ink transition-colors duration-150 ease-ab hover:bg-ab-chill/60 hover:text-ab-tank",
                  i === options.length - 1 && lastCellSpan
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
