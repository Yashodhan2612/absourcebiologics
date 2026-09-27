import { cn } from "@/lib/cn";

/**
 * A product code (AB436NX, AB759NX, AB152NX …) — a genuine artifact of the
 * business and the structural device of the whole site (Section 7). Rendering
 * one always goes through this component so the treatment cannot drift.
 *
 * Called "product code" throughout. The site previously called the same thing
 * a "strain code" in one place and a "strain index" in another; this is the
 * client's own term and the only one now used.
 *
 * The codes themselves live in src/content/cultures.ts and are the client's
 * own, from their taste-profile catalogue. They replaced a set of placeholder
 * codes (CU01, YC01, LF01 …) written during the build, which a buyer had no
 * way of telling apart from real ones.
 */
export function ProductCode({
  code,
  className,
  tone = "default",
}: {
  code: string;
  className?: string;
  tone?: "default" | "reversed" | "muted";
}) {
  const tones = {
    default: "text-ab-tank border-ab-tank/20",
    reversed: "text-ab-milk border-ab-milk/25",
    muted: "text-ab-ink-60 border-ab-chill",
  } as const;

  return (
    <span
      className={cn(
        // self-start + w-fit keep the code hugging its text when it lands in a
        // flex column, where inline-block alone would stretch it full width.
        "mono-ab inline-block w-fit self-start border px-1.5 py-0.5 leading-none",
        tones[tone],
        className
      )}
    >
      {code}
    </span>
  );
}
