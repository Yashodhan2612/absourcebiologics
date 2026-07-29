import { cn } from "@/lib/cn";

/**
 * Disclosure built on native <details>/<summary>.
 *
 * Deliberately zero-JS: it is keyboard operable, screen-reader correct and
 * crawlable for free, and the content is in the server-rendered HTML whether
 * open or closed — which matters for the FAQPage structured data in Section 11.
 */
export function Accordion({
  items,
  className,
  headingLevel: H = "h3",
}: {
  items: ReadonlyArray<{ q: string; a: React.ReactNode }>;
  className?: string;
  headingLevel?: "h2" | "h3" | "h4";
}) {
  return (
    <div className={cn("border-t border-ab-chill", className)}>
      {items.map((item) => (
        <details key={item.q} className="group border-b border-ab-chill">
          <summary
            className={cn(
              "flex cursor-pointer list-none items-start justify-between gap-6 py-5",
              "[&::-webkit-details-marker]:hidden"
            )}
          >
            <H className="font-display text-[1.25rem] leading-tight tracking-[-0.02em] text-ab-ink">
              {item.q}
            </H>
            <span
              aria-hidden="true"
              className="mt-1 shrink-0 text-ab-ink-60 transition-transform duration-150 ease-ab group-open:rotate-45"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1v14M1 8h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </summary>
          <div className="measure-ab pb-6 text-ab-ink-60">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
