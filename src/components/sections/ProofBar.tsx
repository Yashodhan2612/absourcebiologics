import { cn } from "@/lib/cn";
import { stats } from "@/content/stats";

/**
 * Four proof points in monospace. No icons — the type does the work
 * (Section 8, homepage section 3).
 *
 * The figures come from stats.ts and are guarded on `verified`, never typed in
 * as string literals. Hardcoding them here would bypass the one mechanism that
 * stops an unconfirmed number reaching the page.
 *
 * "Est. 2014" and "Pune, India" were dropped when the hero eyebrow started
 * carrying both — they sat about one viewport apart and said the same thing
 * twice. The certification list and the customer count moved up here from the
 * two homepage sections that were removed in the same pass.
 *
 * Delivery is qualified "in India". The three-to-five day figure is a domestic
 * lead time, and the page now also speaks to export buyers, so an unqualified
 * promise would be one ABsource cannot keep overseas.
 */
const PROOF: ReadonlyArray<string | null> = [
  stats.customersServed.verified
    ? `${stats.customersServed.display ?? stats.customersServed.value} customers`
    : null,
  stats.qualityChecks.verified
    ? `${stats.qualityChecks.value} quality checks per batch`
    : null,
  "ISO 9001 · ISO 22000 · HACCP · HALAL",
  "3–5 day delivery in India",
];

export function ProofBar() {
  const items = PROOF.filter((i): i is string => i !== null);

  return (
    <section className="border-b border-ab-chill bg-ab-white" aria-label="Company credentials">
      <div className="container-ab">
        {/*
          Borders are computed per index rather than expressed with `divide-y`
          plus `first:` and `nth-child` variants.

          The variant approach does not survive three different column counts.
          `lg:first:border-l-0` and `lg:[&:nth-child(2n+1)]:border-l` have equal
          specificity, so source order decided the winner and cell 1 kept a left
          rule and a 24px indent against the container edge at desktop — the
          exact defect this rewrite was meant to fix. `divide-y` was silently
          losing too. Index arithmetic is longer to read but it is verifiable:
          one row per breakpoint, and you can check it by counting.

          Layout: 1 column below sm, 2 columns at sm, 4 columns at lg.
        */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li
              key={item}
              className={cn(
                "mono-ab py-5 text-ab-ink-60",
                // Horizontal rules. Never set and then reset at the same
                // breakpoint — `border-t` and `border-t-0` are one utility
                // group, so whichever Tailwind emits later wins regardless of
                // the order they appear in the class attribute, and the reset
                // silently ate the second row's rule.
                //   i 0: never has a rule above it.
                //   i 1: stacked only. At sm it is row 1, column 2.
                //   i 2+: stacked, and row 2 at sm. Never at lg — one row.
                i === 1 && "border-t border-ab-chill sm:border-t-0",
                i >= 2 && "border-t border-ab-chill lg:border-t-0",
                // Vertical rules, by column position at each breakpoint.
                //   odd indices are the right-hand column at sm, and stay
                //   ruled at lg;
                //   even indices from 2 are the left column at sm (no rule)
                //   but need one once the row splits into four.
                i % 2 === 1 && "sm:border-l sm:border-ab-chill sm:pl-6",
                i >= 2 && i % 2 === 0 && "lg:border-l lg:border-ab-chill lg:pl-6"
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
