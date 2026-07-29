import { cn } from "@/lib/cn";
import type { StatEntry } from "@/content/stats";

/**
 * A stat tile renders ONLY when its source entry is verified.
 *
 * The live WordPress site renders "0 +" for Years / Countries / Customers,
 * which tells a buyer the company has zero customers. The fix is structural:
 * an unverified stat returns null and the tile disappears entirely. There is
 * no code path here that can emit a zero or a guess (Section 3).
 *
 * Counters do not animate. Section 16 bans count-up-on-scroll.
 */
export function Stat({
  entry,
  label,
  className,
  tone = "default",
}: {
  entry: StatEntry;
  label: string;
  className?: string;
  tone?: "default" | "reversed";
}) {
  if (!entry.verified) return null;

  const value = "display" in entry && entry.display ? entry.display : String(entry.value);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span
        className={cn(
          "font-display text-[2.75rem] leading-none tracking-[-0.03em] md:text-[3.75rem]",
          tone === "reversed" ? "text-ab-milk" : "text-ab-tank"
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "mono-ab",
          tone === "reversed" ? "text-ab-tank-300" : "text-ab-ink-60"
        )}
      >
        {label}
      </span>
    </div>
  );
}
