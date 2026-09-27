"use client";

import { useState } from "react";
import { TextField, SelectField } from "@/components/ui/Field";
import { FormShell, fieldError } from "./FormShell";
import { useLeadSubmit } from "./useLeadSubmit";
import { company } from "@/content/company";

/**
 * Vendor audit request.
 *
 * Routes to the QA inbox, not to sales — see INBOXES in src/lib/email.ts. The
 * person who holds the certifications, the audit pack and the site-visit
 * calendar is in quality, and a vendor-approval request sitting in a sales
 * queue is how an audit deadline gets missed.
 *
 * It asks what kind of request it is, because the four answers need four
 * different preparations: a documentation pack can go out the same day, a
 * site visit needs a date, and a customer questionnaire needs someone to sit
 * and fill it in. Knowing which before replying saves a round trip.
 */
const REQUEST_OPTIONS = [
  { value: "documentation", label: "Certification and audit documentation" },
  { value: "site-visit", label: "A site visit or audit date" },
  { value: "questionnaire", label: "Our response to your vendor questionnaire" },
  { value: "other", label: "Something else" },
];

export function VendorAuditForm() {
  const { state, submit, startedAt } = useLeadSubmit("audit");
  const [values, setValues] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    request: "",
    message: "",
  });

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <FormShell
      state={state}
      startedAt={startedAt}
      submitLabel="Send the request"
      successTitle="With our QA team."
      successBody={`Your request has gone to quality assurance, who hold the certifications and the audit pack. If it is urgent, email ${company.qaEmail} directly.`}
      onSubmit={(e) => {
        e.preventDefault();
        void submit(values, e.currentTarget);
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
        label="Company"
        required
        autoComplete="organization"
        hint="The dairy or organisation running the approval."
        value={values.company}
        onChange={(e) => set("company")(e.target.value)}
        error={fieldError(state, "company")}
      />
      <TextField
        label="Work email"
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
      <SelectField
        label="What do you need?"
        placeholder="Select"
        options={REQUEST_OPTIONS}
        value={values.request}
        onChange={(e) => set("request")(e.target.value)}
        error={fieldError(state, "request")}
      />
      <TextField
        label="Anything else we should know"
        multiline
        hint="Deadlines, the standard you are auditing against, or a questionnaire reference."
        value={values.message}
        onChange={(e) => set("message")(e.target.value)}
      />
    </FormShell>
  );
}
