"use client";

import { useRouter } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { MAKING_OPTIONS } from "@/lib/selector-questions";

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
 */
export function SelectorTeaser() {
  const router = useRouter();

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
      <div>
        <Eyebrow className="mb-5">Culture Selector</Eyebrow>
        <h2 className="text-[2rem] leading-[0.98] tracking-[-0.03em] text-ab-ink md:text-[2.75rem]">
          Thirteen culture lines. Answer eight questions and we&rsquo;ll narrow it to
          three.
        </h2>
        <p className="measure-ab mt-6 text-base leading-[1.6] text-ab-ink-60">
          It takes under a minute, it asks the questions a dairy technologist would ask,
          and it tells you when it is not confident enough to recommend anything.
        </p>
      </div>

      <div>
        <fieldset>
          <legend className="mono-ab mb-5 text-ab-ink-60">
            Question 1 of 8 &middot; What are you making?
          </legend>
          <div className="grid grid-cols-2 gap-px border border-ab-chill bg-ab-chill sm:grid-cols-3">
            {MAKING_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  router.push(`/culture-selector?making=${option.value}&step=2`)
                }
                className="bg-ab-white px-4 py-5 text-left text-[0.9375rem] text-ab-ink transition-colors duration-150 ease-ab hover:bg-ab-chill/60 hover:text-ab-tank"
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
