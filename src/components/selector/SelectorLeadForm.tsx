"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/Field";
import { FormShell, fieldError } from "@/components/forms/FormShell";
import { useLeadSubmit } from "@/components/forms/useLeadSubmit";
import type { SelectorAnswers } from "@/lib/selector-engine";
import type { Match } from "@/lib/selector-engine";

/**
 * "Email me this recommendation" — the selector's lead capture.
 *
 * Optional, and shown AFTER the result. Gating the recommendation would
 * destroy both the tool's usefulness and its shareability, which are the two
 * things that make it worth building (Section 9).
 *
 * The full answer set travels with the submission so sales sees exactly what
 * the buyer specified rather than just an email address.
 */
export function SelectorLeadForm({
  answers,
  matches,
}: {
  answers: SelectorAnswers;
  matches: readonly Match[];
}) {
  const [email, setEmail] = useState("");
  const { state, submit, startedAt } = useLeadSubmit("selector");

  const answerRecord = Object.fromEntries(
    Object.entries(answers).filter(([, v]) => typeof v === "string")
  ) as Record<string, string>;

  return (
    <div className="max-w-xl">
      <h3 className="text-[1.5rem] text-ab-ink">Email me this recommendation</h3>
      <p className="measure-ab mt-2 text-[0.9375rem] text-ab-ink-60">
        We&rsquo;ll send the match and your answers so you can forward them internally.
        Optional &mdash; the result above is yours either way.
      </p>

      <FormShell
        className="mt-6"
        state={state}
        startedAt={startedAt}
        submitLabel="Email me this"
        successTitle="Sent."
        successBody="Check your inbox. A technologist has the same summary and will follow up if it looks like a trial is worth setting up."
        onSubmit={(e) => {
          e.preventDefault();
          void submit({
            email,
            answers: answerRecord,
            matches: matches.map((m) => m.sku),
          });
        }}
      >
        <TextField
          label="Work email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@dairy.co.in"
          error={fieldError(state, "email")}
        />
      </FormShell>
    </div>
  );
}
