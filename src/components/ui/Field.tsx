"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Form controls. 4px radius (the only radius in the system besides buttons).
 *
 * Errors are specific and written in the interface's voice — "Enter a work
 * email so we can send the data sheet", never "Invalid input" (Section 10).
 * The error text is wired to the control with aria-describedby and announced
 * via role="alert".
 */

const CONTROL =
  "w-full rounded-ab border bg-ab-white px-3.5 py-2.5 text-base text-ab-ink " +
  "placeholder:text-ab-ink-60/60 transition-colors duration-150 ease-ab " +
  "focus:border-ab-tank";

function controlTone(invalid: boolean): string {
  return invalid ? "border-ab-alert" : "border-ab-chill hover:border-ab-ink/40";
}

type BaseProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

function Shell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[0.9375rem] font-medium text-ab-ink">
        {label}
        {required ? (
          <span className="text-ab-alert" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className="ml-2 text-[0.8125rem] font-normal text-ab-ink-60">
            optional
          </span>
        )}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-[0.875rem] text-ab-ink-60">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[0.875rem] text-ab-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(
    Boolean
  );
  return ids.length ? ids.join(" ") : undefined;
}

export function TextField({
  label,
  hint,
  error,
  required,
  className,
  multiline,
  ...rest
}: BaseProps & { multiline?: boolean } & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const shared = {
    id,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy(id, hint, error),
    required,
    className: cn(CONTROL, controlTone(Boolean(error))),
  };

  return (
    <Shell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {multiline ? (
        <textarea rows={5} {...shared} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...shared} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
    </Shell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  options,
  placeholder,
  ...rest
}: BaseProps & {
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Shell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        required={required}
        className={cn(CONTROL, controlTone(Boolean(error)), "appearance-none pr-10")}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Shell>
  );
}

/**
 * Honeypot + timing pair used by every form (Section 10). The honeypot is
 * hidden from sighted users AND from assistive tech, and is never focusable.
 */
export function SpamTraps({ startedAt }: { startedAt: number }) {
  return (
    <>
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="ab-company-website">Do not fill this in</label>
        <input
          id="ab-company-website"
          type="text"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
    </>
  );
}
