"use client";

import { useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  MAKING_OPTIONS,
  QUESTION_KEYS,
  questionsFor,
  recommend,
  productSlugsOf,
  type Option,
  type Recommendation,
  type SelectorAnswers,
  type VariantMatch,
} from "@/lib/selector";
import type { MakingKey } from "@/content/variants";
import { ProductCode } from "@/components/ui/ProductCode";
import { ProductPackShot } from "@/components/ui/PackShot";
import { packArtworkNote, products } from "@/content/products";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SelectorLeadForm } from "./SelectorLeadForm";

/**
 * The Culture Selector.
 *
 * It asks what is being made, then ONLY the questions that can still separate
 * that product's variants: up to six for curd, one for cheese, none at all for
 * kefir. The question list comes from questionsFor() in src/lib/selector.ts,
 * which reads it off the variant catalogue and the answers so far — this
 * component holds no knowledge of which question belongs to which product.
 *
 * State lives entirely in URL params, so a partially-completed selector is
 * shareable and recoverable, the browser back button works as a step-back, and
 * the homepage teaser can deep-link in with question 1 already answered.
 *
 * Accessibility (Section 12):
 * - Each step is a radiogroup: the options are role="radio", arrow keys move
 *   between them, and the group is labelled by the question.
 * - Step changes are announced via an aria-live region.
 * - Focus moves to the new question heading on each step so a screen-reader
 *   user is not left at the bottom of the previous step.
 *
 * The result is never gated. Email capture is optional and comes after the
 * recommendation — gating it would kill both the tool's usefulness and its
 * shareability (Section 9).
 */

const MAKING_QUESTION = "What are you making?";

/**
 * The option grid is a hairline grid (a 1px gap over a tinted ground), so a
 * short last row would show as a painted empty cell. The last option spans
 * whatever is left of its row instead. Literal class names, because Tailwind
 * only emits classes it can see in the source.
 */
const SM_SPAN = ["", "sm:col-span-2"] as const;
const LG_SPAN = ["lg:col-span-1", "lg:col-span-3", "lg:col-span-2"] as const;

function lastCellSpan(count: number): string {
  return cn(SM_SPAN[count % 2], LG_SPAN[count % 3]);
}

export function SelectorWizard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * The URL is user input. An unknown product or an answer that is not one of
   * that product's options is dropped here, so a hand-edited or stale link can
   * never reach the engine as an answer nobody was offered.
   */
  const { answers, steps } = useMemo(() => {
    const rawMaking = searchParams.get("making");
    const making = MAKING_OPTIONS.some((o) => o.value === rawMaking)
      ? (rawMaking as MakingKey)
      : undefined;

    // Read every parameter first: which questions are asked depends on the
    // earlier answers, so the list is resolved against all of them, and only
    // answers to questions that are actually asked are kept.
    const raw: Record<string, string> = {};
    for (const key of QUESTION_KEYS) {
      const value = searchParams.get(key);
      if (value) raw[key] = value;
    }
    const questions = questionsFor(making, raw);
    const held: Record<string, string> = {};
    for (const question of questions) {
      const value = raw[question.key];
      if (value && question.options.some((o) => o.value === value)) {
        held[question.key] = value;
      }
    }

    const built: SelectorAnswers = { making, ...held };
    return {
      answers: built,
      steps: [
        { key: "making", question: MAKING_QUESTION, options: MAKING_OPTIONS },
        ...questions,
      ] as readonly { key: string; question: string; options: readonly Option[] }[],
    };
  }, [searchParams]);

  const held = answers as Record<string, string | undefined>;
  // The result is shown only once every question that applies is answered, so
  // a link cannot skip to a recommendation the answers do not support.
  const firstOpen = steps.findIndex((s) => held[s.key] === undefined);
  const lastReachable = firstOpen === -1 ? steps.length + 1 : firstOpen + 1;

  const rawStep = Number(searchParams.get("step") ?? "1");
  const requested = Number.isFinite(rawStep) ? Math.max(Math.trunc(rawStep), 1) : 1;
  const step = Math.min(requested, lastReachable);
  const isResult = step > steps.length;

  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const answer = (key: string, value: string, nextStep: number) => {
    const next = new URLSearchParams(searchParams.toString());
    // A different product has different questions. Answers given for the last
    // one must not carry over and silently filter the new one.
    if (key === "making") for (const stale of QUESTION_KEYS) next.delete(stale);
    next.set(key, value);
    next.set("step", String(nextStep));
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const goToStep = (n: number) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("step", String(n));
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  if (isResult) {
    return (
      <SelectorResult
        answers={answers}
        onBack={() => goToStep(steps.length)}
        onRestart={() => router.push(pathname, { scroll: false })}
      />
    );
  }

  const current = steps[step - 1];
  if (!current) return null;

  const selected = held[current.key];
  // No "of N". How many questions follow depends on the answers — picking a
  // cheese ends it, saying no to a probiotic claim opens five more — so a
  // total would be a promise the next answer could break.
  const progress = `Question ${step}`;

  return (
    <div>
      <div className="flex items-center justify-between gap-6">
        <Eyebrow>{progress}</Eyebrow>
        {step > 1 ? (
          <button
            type="button"
            onClick={() => goToStep(step - 1)}
            className="link-wipe mono-ab text-ab-ink-60"
          >
            &larr; Back
          </button>
        ) : null}
      </div>

      {/* Progress through the questions known to apply so far. Presentational
          — the count above carries the position for assistive tech. */}
      <div className="mt-5 flex gap-1" aria-hidden="true">
        {steps.map((s, i) => (
          <span
            key={s.key}
            className={cn(
              "h-0.5 flex-1 transition-colors duration-150 ease-ab",
              i < step - 1 ? "bg-ab-tank" : i === step - 1 ? "bg-ab-culture" : "bg-ab-chill"
            )}
          />
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {progress}. {current.question}
      </p>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-10 text-[2rem] leading-[1.05] tracking-[-0.03em] outline-none md:text-[2.75rem]"
      >
        {current.question}
      </h2>

      <div
        role="radiogroup"
        aria-label={current.question}
        className="mt-10 grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-2 lg:grid-cols-3"
      >
        {current.options.map((option, i) => {
          const isSelected = selected === option.value;
          const isLast = i === current.options.length - 1;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (!selected && i === 0) ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowDown" && e.key !== "ArrowLeft" && e.key !== "ArrowUp") return;
                e.preventDefault();
                const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
                const nextIndex = (i + dir + current.options.length) % current.options.length;
                const group = e.currentTarget.parentElement;
                const buttons = group?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
                buttons?.[nextIndex]?.focus();
              }}
              onClick={() => answer(current.key, option.value, step + 1)}
              className={cn(
                "flex min-h-[6.5rem] flex-col justify-end gap-1 p-6 text-left transition-colors duration-150 ease-ab",
                isLast && lastCellSpan(current.options.length),
                isSelected
                  ? "bg-ab-culture/12 text-ab-ink"
                  : "bg-ab-white text-ab-ink hover:bg-ab-chill/50"
              )}
            >
              <span className="text-[1.0625rem]">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ result */

function ResultFooter({
  onBack,
  onRestart,
}: {
  onBack: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="mt-10 flex gap-6">
      <button type="button" onClick={onBack} className="link-wipe mono-ab text-ab-ink-60">
        &larr; Change an answer
      </button>
      <button type="button" onClick={onRestart} className="link-wipe mono-ab text-ab-ink-60">
        Start again
      </button>
    </div>
  );
}

/** One suggested variant: its code, the client's description, and why. */
function VariantRow({
  match,
  recommendation,
}: {
  match: VariantMatch;
  recommendation: Recommendation;
}) {
  const ranked = recommendation.kind === "narrowed";
  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <ProductCode code={match.variant.code} />
        {ranked ? (
          <span className="mono-ab text-ab-culture">
            Matches {match.matched.length} of your {recommendation.answered}{" "}
            {recommendation.answered === 1 ? "answer" : "answers"}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-base leading-[1.6] text-ab-ink">
        {match.variant.descriptor}
      </p>
      {ranked && match.matched.length > 0 ? (
        <p className="mt-1 text-[0.875rem] leading-[1.55] text-ab-ink-60">
          Agrees on: {match.matched.join(" · ")}
        </p>
      ) : null}
      {match.conflicts.length > 0 ? (
        <p className="mt-1 text-[0.875rem] leading-[1.55] text-ab-ink-60">
          Differs on: {match.conflicts.join(" · ")}
        </p>
      ) : null}
    </li>
  );
}

function SelectorResult({
  answers,
  onBack,
  onRestart,
}: {
  answers: SelectorAnswers;
  onBack: () => void;
  onRestart: () => void;
}) {
  const recommendation = recommend(answers);

  // No confident match. This is a designed outcome, not a failure state — the
  // engine deliberately declines rather than returning a near-miss.
  if (!recommendation) {
    return (
      <div>
        <Eyebrow className="mb-6">No confident match</Eyebrow>
        <h2 className="text-[2rem] leading-[1.05] tracking-[-0.03em] md:text-[2.75rem]">
          We&rsquo;d rather look at this properly.
        </h2>
        <p className="measure-ab mt-6 text-[1.25rem] leading-[1.5] text-ab-ink-60">
          Nothing in the range is a confident fit for what you described, and we would
          rather tell you that than point you at the nearest approximation. Send us the
          spec and a technologist will come back to you &mdash; this is often where a
          custom culture starts.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/request-a-quote" size="lg">
            Send us your spec
          </ButtonLink>
          <ButtonLink href="/services/custom-culture-development" variant="secondary" size="lg">
            About custom development
          </ButtonLink>
        </div>
        <ResultFooter onBack={onBack} onRestart={onRestart} />
      </div>
    );
  }

  /**
   * Suggestions are grouped by the product line each is ordered against. That
   * is usually one line. It is two when, say, a low-fat variant and a standard
   * one both fit a curd maker's answers: the codes are ranked together by the
   * engine, and the first line listed is the one the best match belongs to.
   */
  const lines = productSlugsOf(recommendation).map((slug) => ({
    product: products.find((p) => p.slug === slug),
    slug,
    matches: recommendation.variants.filter((v) => v.productSlug === slug),
  }));
  const ranked = recommendation.kind === "narrowed";

  return (
    <div>
      <Eyebrow className="mb-6">Your match</Eyebrow>

      <div className="flex flex-col gap-6">
        {lines.map(({ product, slug, matches }, index) => {
          const name = product?.name ?? matches[0]?.productName ?? slug;
          const href = product ? `/products/${product.category}/${product.slug}` : "/products";
          // The colour-coding note belongs only under catalogue artwork.
          const showsArtwork =
            product?.category === "cultures" &&
            Boolean(product.image) &&
            product.imageKind !== "photo";

          return (
            <div
              key={slug}
              className="grid gap-10 border border-ab-chill bg-ab-white p-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-12 md:p-10"
            >
              <div>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <ProductPackShot slug={slug} sizes="(min-width: 768px) 16rem, 100vw" />
                </div>
                {showsArtwork ? (
                  <p className="mt-3 text-[0.8125rem] leading-[1.5] text-ab-ink-60">
                    {packArtworkNote.short}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col justify-center">
                <p className="mono-ab mb-3 text-ab-ink-60">
                  {index === 0 ? "Product line" : "Also worth trialling"}
                </p>
                <h2 className="text-[2.25rem] leading-[0.98] tracking-[-0.03em] md:text-[2.75rem]">
                  {name}
                </h2>
                {product ? (
                  <p className="mt-3 text-base leading-[1.6] text-ab-ink-60">
                    {product.summary}.{" "}
                    <Link href={href} className="link-wipe text-ab-tank no-underline">
                      About {name}
                    </Link>
                  </p>
                ) : null}

                <div className="mt-8 border-t border-ab-chill pt-6">
                  <p className="mono-ab text-ab-ink-60">
                    {ranked
                      ? matches.length === 1
                        ? "Suggested variant"
                        : "Suggested variants, best fit first"
                      : matches.length === 1
                        ? "The variant in this line"
                        : "The variants in this line"}
                  </p>
                  <ul className="mt-5 divide-y divide-ab-chill">
                    {matches.map((match) => (
                      <VariantRow
                        key={match.variant.code}
                        match={match}
                        recommendation={recommendation}
                      />
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <ButtonLink href={`/request-a-quote?sku=${slug}`} size="lg">
                    Request a sample of {name}
                  </ButtonLink>
                  {index === 0 ? (
                    <ButtonLink href="/contact" variant="secondary" size="lg">
                      Talk to a technologist
                    </ButtonLink>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* What the list is, and what it is not. A code is what gets typed onto
          a purchase order, so the result is explicit that a person confirms
          it — and says when the range holds more than is shown. */}
      <p className="measure-ab mt-6 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
        {ranked
          ? "Ranked by how many of your answers each variant’s own description agrees with. "
          : "These are the variants in this line; nothing you were asked separates them. "}
        {recommendation.remaining > 0
          ? ranked
            ? `${recommendation.remaining} more ${recommendation.remaining === 1 ? "variant comes" : "variants come"} close. `
            : `The line holds ${recommendation.remaining} more. `
          : ""}
        Quote a code with your sample request and a technologist confirms it
        against your milk and process before anything ships.
      </p>

      {/* Optional, and after the result. Never a gate. */}
      <div className="mt-14 border-t border-ab-chill pt-10">
        <SelectorLeadForm answers={answers} recommendation={recommendation} />
      </div>

      <ResultFooter onBack={onBack} onRestart={onRestart} />
    </div>
  );
}
