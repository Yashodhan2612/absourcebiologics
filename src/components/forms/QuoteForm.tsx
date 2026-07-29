"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { TextField, SelectField } from "@/components/ui/Field";
import { ChipStatic } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { FormShell, fieldError } from "./FormShell";
import { useLeadSubmit } from "./useLeadSubmit";
import { products } from "@/content/products";
import { solutions } from "@/content/solutions";

/**
 * Domestic quote request.
 *
 * Progressive by design (Section 10): what you're making comes first, volumes
 * second, and contact details LAST — once the buyer has invested effort. Asking
 * for a phone number before asking what they make is how a form gets abandoned.
 *
 * Pre-fillable via ?sku= and ?application=, so the product pages, the solution
 * pages and the Culture Selector all carry context in rather than dumping the
 * buyer at an empty form. The selected SKU shows as a chip throughout.
 */
const STEPS = ["What you're making", "Volumes and timeline", "Who you are"] as const;

export function QuoteForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const { state, submit, startedAt } = useLeadSubmit("quote");

  const [values, setValues] = useState({
    sku: searchParams.get("sku") ?? "",
    application: searchParams.get("application") ?? "",
    message: "",
    volume: "",
    timeline: "",
    name: "",
    email: "",
    company: "",
    phone: "",
    city: "",
  });

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const selectedProduct = products.find((p) => p.slug === values.sku);
  const isLast = step === STEPS.length - 1;

  return (
    <div>
      {/* The SKU travels with the buyer through every step. */}
      {selectedProduct ? (
        <div className="mb-8">
          <ChipStatic>
            {selectedProduct.name}
            {selectedProduct.strainCode ? ` · ${selectedProduct.strainCode}` : ""}
          </ChipStatic>
        </div>
      ) : null}

      <ol className="mb-10 flex flex-wrap gap-x-6 gap-y-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={`mono-ab ${i === step ? "text-ab-tank" : "text-ab-ink-60/70"}`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <FormShell
        state={state}
        startedAt={startedAt}
        submitLabel={isLast ? "Send my spec" : "Continue"}
        successTitle="Got it."
        successBody="A technologist will read this and reply with a recommendation and a sample. If we need to understand your process better first, we'll ask rather than guess."
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLast) {
            setStep((s) => s + 1);
            return;
          }
          void submit(values);
        }}
      >
        {step === 0 ? (
          <>
            <SelectField
              label="What are you making?"
              placeholder="Select an application"
              value={values.application}
              onChange={(e) => set("application")(e.target.value)}
              options={solutions.map((s) => ({ value: s.slug, label: s.name }))}
            />
            <SelectField
              label="Product of interest"
              placeholder="Not sure yet — recommend one"
              value={values.sku}
              onChange={(e) => set("sku")(e.target.value)}
              options={products.map((p) => ({
                value: p.slug,
                label: p.strainCode ? `${p.name} (${p.strainCode})` : p.name,
              }))}
            />
            <TextField
              label="What are you trying to achieve?"
              multiline
              hint="Texture, acidity, shelf life, or what's going wrong with your current culture."
              value={values.message}
              onChange={(e) => set("message")(e.target.value)}
            />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <TextField
              label="Volumes"
              hint="Litres per day, or per batch — whichever you think in."
              value={values.volume}
              onChange={(e) => set("volume")(e.target.value)}
            />
            <TextField
              label="Timeline"
              hint="When do you want to run a trial?"
              value={values.timeline}
              onChange={(e) => set("timeline")(e.target.value)}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
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
            <TextField
              label="City"
              autoComplete="address-level2"
              value={values.city}
              onChange={(e) => set("city")(e.target.value)}
            />
          </>
        ) : null}

        {step > 0 ? (
          <div>
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          </div>
        ) : null}
      </FormShell>
    </div>
  );
}
