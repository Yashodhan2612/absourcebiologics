"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/Field";
import { FormShell, fieldError } from "./FormShell";
import { useLeadSubmit } from "./useLeadSubmit";

export function ContactForm() {
  const { state, submit, startedAt } = useLeadSubmit("contact");
  const [values, setValues] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <FormShell
      state={state}
      startedAt={startedAt}
      submitLabel="Send message"
      successTitle="Thanks — that's with us."
      successBody="Someone will reply directly. If it's urgent, the phone numbers above reach the office during working hours."
      onSubmit={(e) => {
        e.preventDefault();
        void submit(values);
      }}
    >
      <TextField
        label="What can we help with?"
        multiline
        required
        hint="The more specific you are, the more useful the reply."
        value={values.message}
        onChange={(e) => set("message")(e.target.value)}
      />
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
    </FormShell>
  );
}
