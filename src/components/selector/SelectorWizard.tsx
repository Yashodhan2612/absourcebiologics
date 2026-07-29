"use client";

import { useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { stepsFor, type StepKey } from "@/lib/selector-questions";
import { recommend, type SelectorAnswers } from "@/lib/selector-engine";
import type { MakingAnswer } from "@/content/types";
import { StrainCode } from "@/components/ui/StrainCode";
import { ProductPackShot } from "@/components/ui/PackShot";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SelectorLeadForm } from "./SelectorLeadForm";

/**
 * The Culture Selector.
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
export function SelectorWizard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const answers = useMemo<SelectorAnswers>(
    () => ({
      making: (searchParams.get("making") as MakingAnswer | null) ?? undefined,
      packFormat: (searchParams.get("packFormat") as SelectorAnswers["packFormat"]) ?? undefined,
      milkFat: (searchParams.get("milkFat") as SelectorAnswers["milkFat"]) ?? undefined,
      acidity: (searchParams.get("acidity") as SelectorAnswers["acidity"]) ?? undefined,
      texture: (searchParams.get("texture") as SelectorAnswers["texture"]) ?? undefined,
      flavour: (searchParams.get("flavour") as SelectorAnswers["flavour"]) ?? undefined,
      probiotic: (searchParams.get("probiotic") as SelectorAnswers["probiotic"]) ?? undefined,
      batchSize: (searchParams.get("batchSize") as SelectorAnswers["batchSize"]) ?? undefined,
    }),
    [searchParams]
  );

  const steps = stepsFor(answers.making);
  const rawStep = Number(searchParams.get("step") ?? "1");
  const step = Number.isFinite(rawStep) ? Math.min(Math.max(rawStep, 1), steps.length + 1) : 1;
  const isResult = step > steps.length;

  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const setParam = (key: string, value: string, nextStep: number) => {
    const next = new URLSearchParams(searchParams.toString());
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

  const selected = answers[current.key as keyof SelectorAnswers];

  return (
    <div>
      <div className="flex items-center justify-between gap-6">
        <Eyebrow>
          Question {step} of {steps.length}
        </Eyebrow>
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

      {/* Progress. Presentational — the count above carries the same
          information for assistive tech. */}
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
        Question {step} of {steps.length}. {current.question}
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
              onClick={() => setParam(current.key as StepKey, option.value, step + 1)}
              className={cn(
                "flex min-h-[6.5rem] flex-col justify-end gap-1 p-6 text-left transition-colors duration-150 ease-ab",
                isSelected
                  ? "bg-ab-culture/12 text-ab-ink"
                  : "bg-ab-white text-ab-ink hover:bg-ab-chill/50"
              )}
            >
              <span className="text-[1.0625rem]">{option.label}</span>
              {option.hint ? (
                <span className="mono-ab text-ab-ink-60">{option.hint}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
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
  const matches = recommend(answers);
  const [top, ...rest] = matches;

  // No confident match. This is a designed outcome, not a failure state — the
  // engine deliberately declines rather than returning a near-miss.
  if (!top) {
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
        <div className="mt-10 flex gap-6">
          <button type="button" onClick={onBack} className="link-wipe mono-ab text-ab-ink-60">
            &larr; Change an answer
          </button>
          <button type="button" onClick={onRestart} className="link-wipe mono-ab text-ab-ink-60">
            Start again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Eyebrow className="mb-6">Your match</Eyebrow>

      <div className="grid gap-10 border border-ab-chill bg-ab-white p-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-12 md:p-10">
        <div className="relative aspect-[4/5] overflow-hidden">
          <ProductPackShot slug={top.slug} sizes="(min-width: 768px) 16rem, 100vw" />
        </div>
        <div className="flex flex-col justify-center">
          <div className="mb-4 flex items-center gap-3">
            {top.strainCode ? <StrainCode code={top.strainCode} /> : null}
            <span className="mono-ab text-ab-culture">{top.score}% fit</span>
          </div>
          <h2 className="text-[2.75rem] leading-[0.95] tracking-[-0.03em]">{top.name}</h2>
          <ul className="mt-6 flex flex-col gap-2">
            {top.reasons.map((reason) => (
              <li key={reason} className="text-base leading-[1.6] text-ab-ink-60">
                {reason}
              </li>
            ))}
          </ul>
          {top.caveats.length > 0 ? (
            <div className="mt-6 border-l-2 border-ab-ghee-dark pl-4">
              {top.caveats.map((caveat) => (
                <p key={caveat} className="text-[0.9375rem] leading-[1.55] text-ab-ink-60">
                  {caveat}
                </p>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href={`/request-a-quote?sku=${top.slug}`} size="lg">
              Request a sample of {top.name}
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Talk to a technologist
            </ButtonLink>
          </div>
        </div>
      </div>

      {rest.length > 0 ? (
        <>
          <h3 className="mono-ab mt-12 mb-4 text-ab-ink-60">Also worth trialling</h3>
          <ul className="grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-2">
            {rest.map((match) => (
              <li key={match.slug} className="bg-ab-white">
                <Link
                  href={`/products/cultures/${match.slug}`}
                  className="group flex h-full flex-col gap-3 p-6 no-underline"
                >
                  <div className="flex items-center gap-3">
                    {match.strainCode ? (
                      <StrainCode code={match.strainCode} tone="muted" />
                    ) : null}
                    <span className="mono-ab text-ab-ink-60">{match.score}% fit</span>
                  </div>
                  <span className="font-display text-[1.5rem] tracking-[-0.02em] text-ab-ink group-hover:text-ab-tank">
                    {match.name}
                  </span>
                  <span className="text-[0.9375rem] leading-[1.55] text-ab-ink-60">
                    {match.reasons[0]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {/* Optional, and after the result. Never a gate. */}
      <div className="mt-14 border-t border-ab-chill pt-10">
        <SelectorLeadForm answers={answers} matches={matches} />
      </div>

      <div className="mt-10 flex gap-6">
        <button type="button" onClick={onBack} className="link-wipe mono-ab text-ab-ink-60">
          &larr; Change an answer
        </button>
        <button type="button" onClick={onRestart} className="link-wipe mono-ab text-ab-ink-60">
          Start again
        </button>
      </div>
    </div>
  );
}
