"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/Field";
import { FormShell, fieldError } from "./FormShell";
import { useLeadSubmit } from "./useLeadSubmit";
import { company } from "@/content/company";

/**
 * Open application.
 *
 * CV UPLOAD — deliberately not implemented as a file input.
 *
 * The brief asks for CV upload with PDF/DOC validation and a 5MB cap, and the
 * constraints for it are defined in schema.ts (CV_MAX_BYTES,
 * CV_ACCEPTED_MIME). What is missing is somewhere to put the file: accepting
 * uploads needs a blob store and a retention policy for what is, by
 * definition, personal data. Shipping an input that accepts a CV and then
 * drops it would be worse than not having one.
 *
 * Candidates are asked to email the CV instead, which works today and creates
 * no data-protection liability. See CONTENT-TODO.md for what to decide.
 */
export function CareersForm() {
  const { state, submit, startedAt } = useLeadSubmit("careers");
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    message: "",
  });

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <FormShell
      state={state}
      startedAt={startedAt}
      submitLabel="Send application"
      successTitle="Received."
      successBody={`Thanks — we'll be in touch if there's a fit. Send your CV to ${company.email} with the same name so we can match them up.`}
      onSubmit={(e) => {
        e.preventDefault();
        void submit(values);
      }}
    >
      <TextField
        label="Your name"
        required
        autoComplete="name"
        value={values.name}
        onChange={(e) => set("name")(e.target.value)}
        error={fieldError(state, "name")}
      />
      <TextField
        label="Email"
        type="email"
        required
        autoComplete="email"
        value={values.email}
        onChange={(e) => set("email")(e.target.value)}
        error={fieldError(state, "email")}
      />
      <TextField
        label="Phone"
        type="tel"
        autoComplete="tel"
        value={values.phone}
        onChange={(e) => set("phone")(e.target.value)}
      />
      <TextField
        label="What kind of work are you looking for?"
        hint="Microbiology, biotechnology, dairy technology, production, quality…"
        value={values.role}
        onChange={(e) => set("role")(e.target.value)}
      />
      <TextField
        label="Tell us about your background"
        multiline
        value={values.message}
        onChange={(e) => set("message")(e.target.value)}
      />
      <p className="text-[0.875rem] leading-[1.6] text-ab-ink-60">
        Send your CV to{" "}
        <a href={`mailto:${company.email}`} className="link-wipe text-ab-ink no-underline">
          {company.email}
        </a>{" "}
        after submitting this form and we will match it to your application.
      </p>
    </FormShell>
  );
}
