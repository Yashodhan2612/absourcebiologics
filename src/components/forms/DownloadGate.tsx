"use client";

import { useRef, useState } from "react";
import { TextField, SelectField, SpamTraps } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { REQUESTER_ROLES, type DownloadDoc } from "@/content/downloads";

/**
 * Verification gate in front of a document.
 *
 * This used to ask for an email and an optional company, then stream the file
 * back in the same interaction. The client asked for controls: a data sheet
 * carries composition, dosage and incubation parameters, and they want to
 * authenticate the dairy before one goes out.
 *
 * So every field here is required, and for a document marked `on-approval`
 * nothing is streamed — the request is recorded, sales gets everything needed
 * to phone the plant and confirm, and a person releases the file. Documents
 * marked `instant` still download in the same interaction, so the two
 * behaviours are a content decision rather than a code branch here.
 *
 * Errors are held per field. The previous version put every error under Work
 * email, which with seven fields would point the buyer at the wrong one.
 */
export function DownloadGate({
  doc,
  startedAt,
}: {
  doc: DownloadDoc;
  /** Owned by the library, so remounting on a document switch does not reset
      the anti-bot timing window. */
  startedAt: number;
}) {
  const [values, setValues] = useState({
    company: "",
    name: "",
    role: "",
    email: "",
    phone: "",
    city: "",
    country: "India",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "released" | "pending">("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  // Whether the request actually reached the sales inbox. Under approval-based
  // release the email IS the delivery mechanism, so a silent failure would
  // leave someone waiting for a sheet nobody was told to send.
  const [notified, setNotified] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  // Widened to include textarea: TextField's onChange is the intersection of
  // the input and textarea handlers, so a handler that omits textarea is not
  // assignable to it.
  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setFieldErrors({});
    setFormError(null);

    // The honeypot lives in the DOM via SpamTraps but nothing was reading it,
    // so the trap the schema documents at length never fired. Read it off the
    // submitted form so a bot that fills it is actually caught.
    const trap = new FormData(e.currentTarget).get("companyWebsite");

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadType: "download",
          ...values,
          doc: doc.slug,
          startedAt,
          companyWebsite: typeof trap === "string" && trap ? trap : undefined,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        released?: boolean;
        notified?: boolean;
        url?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!data.ok) {
        const errors = data.fieldErrors ?? {};
        setFieldErrors(errors);
        setFormError(
          Object.keys(errors).length
            ? // A single summary rather than silence. Each field also renders
              // its own role="alert", and seven of those firing at once is
              // unusable — this gives a screen reader one sentence to act on,
              // and the focus move below gives it somewhere to go.
              "We need a few more details before we can send this. Check the highlighted fields."
            : data.error ??
              "We couldn't record that request. Try again, or email us directly."
        );
        setStatus("idle");

        // Move focus to the first control that failed. Without this the
        // submit button is gone from the tab position the user was at and
        // focus falls to <body>, so a keyboard or screen-reader user has to
        // walk the whole form again to find out what went wrong.
        requestAnimationFrame(() => {
          const first = formRef.current?.querySelector<HTMLElement>(
            '[aria-invalid="true"]'
          );
          first?.focus();
        });
        return;
      }

      track("download_requested", { doc: doc.slug });

      if (data.url) {
        setStatus("released");
        window.location.href = data.url;
        return;
      }
      setNotified(data.notified !== false);
      setStatus("pending");
    } catch {
      setFormError(
        "We couldn't reach the server. Email info@absourcebiologics.com and we'll send it."
      );
      setStatus("idle");
    }
  };

  if (status === "released") {
    return (
      <div className="border border-ab-culture bg-ab-culture/8 p-6" role="status">
        <p className="text-ab-ink">
          Your download should start automatically. If it doesn&rsquo;t, check your
          browser&rsquo;s download bar &mdash; the link is valid for fifteen minutes.
        </p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="border border-ab-culture bg-ab-culture/8 p-6" role="status">
        <p className="text-[1.25rem] text-ab-ink">Request received.</p>
        <p className="measure-ab mt-3 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
          Data sheets carry composition, dosage and incubation parameters, so we
          confirm who is asking before we send one. A technologist will check
          your details and email the sheet across. If anything needs clarifying
          we will call you on the number you gave.
        </p>
        {!notified ? (
          <p className="measure-ab mt-4 border-t border-ab-chill pt-4 text-[0.9375rem] leading-[1.6] text-ab-ink">
            One thing: our mail system did not confirm your request went through.
            We have it on record, but if you do not hear back within a working
            day, email{" "}
            <a href="mailto:info@absourcebiologics.com" className="link-wipe text-ab-tank">
              info@absourcebiologics.com
            </a>{" "}
            and we will send it straight over.
          </p>
        ) : null}
      </div>
    );
  }

  // `relative` on the form because SpamTraps positions the honeypot absolutely
  // at left:-9999px; FormShell's form carries it for the same reason.
  return (
    <form ref={formRef} onSubmit={onSubmit} className="relative flex flex-col gap-5" noValidate>
      <SpamTraps startedAt={startedAt} />

      {formError ? (
        <p className="border border-ab-alert/40 bg-ab-alert/5 p-4 text-[0.9375rem] text-ab-ink" role="alert">
          {formError}
        </p>
      ) : null}

      <TextField
        label="Company"
        required
        autoComplete="organization"
        hint="The dairy or company the data sheet is for."
        value={values.company}
        onChange={set("company")}
        error={fieldErrors.company}
      />
      <TextField
        label="Your name"
        required
        autoComplete="name"
        value={values.name}
        onChange={set("name")}
        error={fieldErrors.name}
      />
      <SelectField
        label="Your role"
        required
        placeholder="Select"
        options={REQUESTER_ROLES.map((r) => ({ value: r.value, label: r.label }))}
        value={values.role}
        onChange={set("role")}
        error={fieldErrors.role}
      />
      <TextField
        label="Work email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@dairy.co.in"
        hint="We send data sheets to the dairy that will use them."
        value={values.email}
        onChange={set("email")}
        error={fieldErrors.email}
      />
      <TextField
        label="Phone"
        type="tel"
        required
        autoComplete="tel"
        placeholder="+91 90000 00000"
        value={values.phone}
        onChange={set("phone")}
        error={fieldErrors.phone}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="City"
          required
          autoComplete="address-level2"
          value={values.city}
          onChange={set("city")}
          error={fieldErrors.city}
        />
        <TextField
          label="Country"
          required
          autoComplete="country-name"
          value={values.country}
          onChange={set("country")}
          error={fieldErrors.country}
        />
      </div>

      <div>
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Request the data sheet"}
        </Button>
      </div>
    </form>
  );
}
