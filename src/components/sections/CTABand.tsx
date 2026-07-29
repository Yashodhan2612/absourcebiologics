import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Terminal CTA. Every path on the site ends in one of these, and the copy
 * always names the outcome rather than the action (Section 13).
 */
export function CTABand({
  title,
  body,
  href = "/request-a-quote",
  cta = "Send us your spec",
  secondaryHref,
  secondaryCta,
  tone = "reversed",
}: {
  title: string;
  body?: string;
  href?: string;
  cta?: string;
  secondaryHref?: string;
  secondaryCta?: string;
  tone?: "reversed" | "light";
}) {
  const reversed = tone === "reversed";

  return (
    <section
      className={cn(
        "section-ab-tight",
        reversed ? "ab-reversed bg-ab-tank" : "border-y border-ab-chill bg-ab-chill/40"
      )}
    >
      <div className="container-ab">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <h2
              className={cn(
                "max-w-3xl text-[2rem] leading-[0.98] tracking-[-0.03em] md:text-[2.75rem]",
                reversed ? "text-ab-milk" : "text-ab-ink"
              )}
            >
              {title}
            </h2>
            {body ? (
              <p
                className={cn(
                  "measure-ab mt-5 text-base leading-[1.6]",
                  reversed ? "text-ab-tank-300" : "text-ab-ink-60"
                )}
              >
                {body}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-4">
            <ButtonLink href={href} size="lg" variant={reversed ? "primary" : "primary"}>
              {cta}
            </ButtonLink>
            {secondaryHref && secondaryCta ? (
              <ButtonLink
                href={secondaryHref}
                size="lg"
                variant={reversed ? "reversed" : "secondary"}
              >
                {secondaryCta}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
