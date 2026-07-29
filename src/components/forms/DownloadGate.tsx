"use client";

import { useRef, useState } from "react";
import { TextField, SpamTraps } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import type { DownloadDoc } from "@/content/downloads";

/**
 * Email gate in front of a document.
 *
 * On success the browser is sent straight to the signed URL, so the buyer gets
 * the file in the same interaction — no redirect to a thank-you page, no
 * "check your email for the link".
 */
export function DownloadGate({ doc }: { doc: DownloadDoc }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef(Date.now());

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadType: "download",
          email,
          company: company || undefined,
          doc: doc.slug,
          startedAt: startedAt.current,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        url?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!data.ok || !data.url) {
        setError(
          data.fieldErrors?.email ??
            data.error ??
            "We couldn't prepare that download. Try again, or email us directly."
        );
        setStatus("idle");
        return;
      }

      track("download_requested", { doc: doc.slug });
      setStatus("done");
      window.location.href = data.url;
    } catch {
      setError("We couldn't reach the server. Email info@absourcebiologics.com and we'll send it.");
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="border border-ab-culture bg-ab-culture/8 p-6" role="status">
        <p className="text-ab-ink">
          Your download should start automatically. If it doesn&rsquo;t, check your
          browser&rsquo;s download bar &mdash; the link is valid for fifteen minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <SpamTraps startedAt={startedAt.current} />
      <TextField
        label="Work email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@dairy.co.in"
        hint="So we can send the data sheet and answer questions about it."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error ?? undefined}
      />
      <TextField
        label="Company"
        autoComplete="organization"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <div>
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Preparing…" : "Download the data sheet"}
        </Button>
      </div>
    </form>
  );
}
