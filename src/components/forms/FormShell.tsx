"use client";

import { cn } from "@/lib/cn";
import type { SubmitState } from "./useLeadSubmit";
import { Button } from "@/components/ui/Button";
import { SpamTraps } from "@/components/ui/Field";

/**
 * Wraps every lead form with the universal behaviour from Section 10: inline
 * success (never a redirect that loses context), a visible loading state, a
 * form-level error region, and the honeypot + timing pair.
 */
export function FormShell({
  state,
  startedAt,
  onSubmit,
  submitLabel,
  successTitle,
  successBody,
  children,
  className,
}: {
  state: SubmitState;
  startedAt: number;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (state.status === "sent") {
    return (
      <div
        className="border border-ab-culture bg-ab-culture/8 p-8"
        role="status"
        aria-live="polite"
      >
        <h3 className="text-[1.5rem] text-ab-ink">{successTitle}</h3>
        <p className="measure-ab mt-3 text-ab-ink-60">{successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("relative flex flex-col gap-6", className)} noValidate>
      <SpamTraps startedAt={startedAt} />

      {children}

      {state.status === "error" ? (
        <p role="alert" className="text-[0.9375rem] text-ab-alert">
          {state.message}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={state.status === "sending"}>
          {state.status === "sending" ? "Sending…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

/** Reads a server-returned field error by name. */
export function fieldError(state: SubmitState, name: string): string | undefined {
  return state.status === "error" ? state.fieldErrors?.[name] : undefined;
}
