"use client";

import { useState } from "react";
import { TextField, SelectField } from "@/components/ui/Field";
import { FormShell, fieldError } from "./FormShell";
import { useLeadSubmit } from "./useLeadSubmit";

/**
 * Export / distributor enquiry. Routed to its own inbox (see email.ts).
 *
 * The confirmation copy deliberately sets a slower expectation than the
 * domestic form: export quotes depend on certification, packaging and shipping
 * terms per market, and promising a same-day reply we cannot make would be
 * worse than saying so.
 */
export function ExportForm() {
  const { state, submit, startedAt } = useLeadSubmit("export");
  const [values, setValues] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    country: "",
    role: "",
    productsOfInterest: "",
    annualVolume: "",
    certifications: "",
    incoterms: "",
    regulatorySupport: "",
    message: "",
  });

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <FormShell
      state={state}
      startedAt={startedAt}
      submitLabel="Send export enquiry"
      successTitle="Received."
      successBody="Export quotations involve confirming certification, packaging and shipping terms for your market, so these take a little longer than a domestic quote. Our export team will come back to you with a full response rather than a holding reply."
      onSubmit={(e) => {
        e.preventDefault();
        void submit(values);
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Country"
          required
          value={values.country}
          onChange={(e) => set("country")(e.target.value)}
          error={fieldError(state, "country")}
        />
        <SelectField
          label="How would you work with us?"
          required
          placeholder="Select"
          value={values.role}
          onChange={(e) => set("role")(e.target.value)}
          error={fieldError(state, "role")}
          options={[
            { value: "distributor", label: "Distributor" },
            { value: "importer", label: "Importer" },
            { value: "end-user", label: "End user" },
          ]}
        />
      </div>

      <TextField
        label="Products of interest"
        hint="Culture lines, ingredients, or the applications you serve."
        value={values.productsOfInterest}
        onChange={(e) => set("productsOfInterest")(e.target.value)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Estimated annual volume"
          value={values.annualVolume}
          onChange={(e) => set("annualVolume")(e.target.value)}
        />
        <TextField
          label="Required certifications"
          hint="HALAL, Kosher, or others your market requires."
          value={values.certifications}
          onChange={(e) => set("certifications")(e.target.value)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Incoterms preference"
          hint="FOB, CIF, EXW…"
          value={values.incoterms}
          onChange={(e) => set("incoterms")(e.target.value)}
        />
        <SelectField
          label="Need local regulatory registration support?"
          placeholder="Select"
          value={values.regulatorySupport}
          onChange={(e) => set("regulatorySupport")(e.target.value)}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "unsure", label: "Not sure yet" },
          ]}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
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
          value={values.company}
          onChange={(e) => set("company")(e.target.value)}
          error={fieldError(state, "company")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
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
      </div>

      <TextField
        label="Anything else"
        multiline
        value={values.message}
        onChange={(e) => set("message")(e.target.value)}
      />
    </FormShell>
  );
}
