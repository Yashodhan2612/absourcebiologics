"use client";

import { useCallback, useRef, useState } from "react";
import { track } from "@/lib/analytics";

export type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

/**
 * Shared submit behaviour for all four lead paths.
 *
 * Every form gets: a visible loading state, an inline success state (never a
 * redirect to a thank-you page that loses context), field-level errors from
 * the server's Zod result, and an analytics event on success (Section 10).
 *
 * `startedAt` is captured when the hook mounts and travels with the payload so
 * the server can reject sub-two-second submissions.
 */
export function useLeadSubmit<T extends Record<string, unknown>>(leadType: string) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const startedAt = useRef(Date.now());

  const submit = useCallback(
    async (values: T) => {
      setState({ status: "sending" });
      try {
        const response = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, leadType, startedAt: startedAt.current }),
        });
        const data = (await response.json()) as {
          ok: boolean;
          error?: string;
          fieldErrors?: Record<string, string>;
        };

        if (!response.ok || !data.ok) {
          setState({
            status: "error",
            message:
              data.error ??
              "Something went wrong sending that. Check the highlighted fields and try again.",
            fieldErrors: data.fieldErrors,
          });
          return false;
        }

        track("lead_submitted", { leadType, ...pickTracked(values) });
        setState({ status: "sent" });
        return true;
      } catch {
        setState({
          status: "error",
          message:
            "We couldn't reach the server. Check your connection, or email info@absourcebiologics.com directly.",
        });
        return false;
      }
    },
    [leadType]
  );

  return { state, submit, startedAt: startedAt.current };
}

/** Only non-personal fields reach analytics. */
function pickTracked(values: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof values.sku === "string") out.sku = values.sku;
  if (typeof values.application === "string") out.application = values.application;
  if (typeof values.doc === "string") out.doc = values.doc;
  return out;
}
