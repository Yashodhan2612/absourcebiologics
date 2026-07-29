import { cn } from "@/lib/cn";

/**
 * The strain code system (CU01, LF01, YC01 ...) is a genuine artifact of the
 * business and the structural device of the whole site — Section 7. Rendering
 * it always goes through this component so the treatment cannot drift.
 */
export function StrainCode({
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
