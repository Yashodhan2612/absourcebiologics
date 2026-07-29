import { cn } from "@/lib/cn";

/**
 * Monospace eyebrow. The mono face is reserved for strain codes, spec tables,
 * dosage figures and eyebrows — nothing else (Section 6, Typography).
 */
export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag className={cn("mono-ab text-ab-ink-60", className)}>{children}</Tag>
  );
}
