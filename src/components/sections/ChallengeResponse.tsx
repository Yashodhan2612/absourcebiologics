"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { challengeResponse } from "@/content/company";

/**
 * The six-row challenge → response table. Shared between the homepage and
 * /why-absource so the two cannot drift apart (Phase 8).
 *
 * Treatment is specified precisely and deliberately (Section 3A, Section 8):
 * a two-column editorial list on desktop — challenge left in the display face,
 * response right in body copy, 1px rule between rows — and a stacked accordion
 * on mobile. No icons, no cards, and no numbering: these are parallel problems,
 * not a sequence, and numbering them would misrepresent the content.
 *
 * Progressive enhancement: every row is server-rendered open, so all six
 * challenges and all six responses are in the initial HTML and crawlable. The
 * collapse is applied on mount and only below the 768px breakpoint, so a
 * mobile reader gets a scannable list rather than six screens of scrolling,
 * and a desktop reader gets the full editorial layout with no interaction.
 */
export function ChallengeResponse({
  weight = "full",
}: {
  /** "full" gives the section a viewport of its own on the homepage.
   *  "compact" tightens it for /why-absource, where it is one of several. */
  weight?: "full" | "compact";
}) {
  const [collapsible, setCollapsible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setCollapsible(mq.matches);
      setOpenIndex(mq.matches ? 0 : null);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <dl className={cn("border-t border-ab-chill", weight === "compact" && "text-[0.95em]")}>
      {challengeResponse.map((row, i) => {
        const open = !collapsible || openIndex === i;
        return (
          <div
            key={row.challenge}
            className={cn(
              "border-b border-ab-chill",
              "md:grid md:grid-cols-[minmax(0,24rem)_1fr] md:gap-12 lg:gap-20",
              weight === "full" ? "md:py-10" : "md:py-8"
            )}
          >
            <dt>
              {/* Below md this is the disclosure control. From md up it is a
                  plain heading — the button semantics are removed entirely
                  rather than left behind as a non-functional control. */}
              {collapsible ? (
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`cr-${i}`}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-start justify-between gap-6 py-5 text-left"
                >
                  <span className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ab-ink">
                    {row.challenge}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 shrink-0 text-ab-ink-60 transition-transform duration-150 ease-ab",
                      open && "rotate-45"
                    )}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
              ) : (
                <p
                  className={cn(
                    "font-display leading-tight tracking-[-0.02em] text-ab-ink",
                    weight === "full" ? "text-[2rem]" : "text-[1.5rem]"
                  )}
                >
                  {row.challenge}
                </p>
              )}
            </dt>

            <dd id={`cr-${i}`} hidden={!open} className="pb-6 md:pb-0">
              <p className="measure-ab text-base leading-[1.6] text-ab-ink-60">
                {row.response}
              </p>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
