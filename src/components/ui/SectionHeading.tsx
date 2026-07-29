import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

/**
 * One idea per viewport. Section headings are sentence case, always
 * (Section 13, Content and voice).
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  className,
  tone = "default",
  as: Tag = "h2",
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  className?: string;
  tone?: "default" | "reversed";
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
}) {
  const reversed = tone === "reversed";
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <Eyebrow className={reversed ? "text-ab-tank-300" : undefined}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Tag
        className={cn(
          "text-[2rem] md:text-[2.75rem] lg:text-[3.75rem]",
          reversed ? "text-ab-milk" : "text-ab-ink"
        )}
      >
        {title}
      </Tag>
      {lede ? (
        <div
          className={cn(
            "measure-ab text-[1.25rem] leading-[1.5]",
            reversed ? "text-ab-tank-300" : "text-ab-ink-60",
            align === "center" && "mx-auto"
          )}
        >
          {lede}
        </div>
      ) : null}
    </div>
  );
}
