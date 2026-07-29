import { cn } from "@/lib/cn";

/**
 * Interim typographic wordmark.
 *
 * The real logo (wp-content/uploads/2020/12/Artboard-1.png) could not be
 * fetched from the live site in this environment, and Section 5 asks for the
 * palette to be reconciled against the logo's actual hex values once it is
 * available. Until then this renders the company name typographically rather
 * than shipping a placeholder graphic that pretends to be a logo.
 *
 * To swap in the real mark: drop it at public/assets/brand/logo.svg (or .png)
 * and replace the markup below with next/image. Nothing else references the
 * logo — Header and Footer both come through here. See CONTENT-TODO.md.
 */
export function Logo({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "reversed";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-[0.3em] leading-none",
        className
      )}
    >
      <span
        className={cn(
          "font-display text-[1.375rem] font-semibold tracking-[-0.03em]",
          tone === "reversed" ? "text-ab-milk" : "text-ab-tank"
        )}
      >
        ABsource
      </span>
      <span
        className={cn(
          "mono-ab text-[0.625rem]",
          tone === "reversed" ? "text-ab-tank-300" : "text-ab-ink-60"
        )}
      >
        Biologics
      </span>
    </span>
  );
}
