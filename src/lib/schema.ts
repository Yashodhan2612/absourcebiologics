import { z } from "zod";

/**
 * Shared validation. The same schemas run on the client for inline field
 * errors and on the server as the actual gate — the client copy is a
 * convenience, never the enforcement point.
 *
 * Error messages are written in the interface's voice and say what to do:
 * "Enter a work email so we can send the data sheet", never "Invalid input"
 * (Section 10).
 */

/** Submissions faster than this are bots. Section 10. */
export const MIN_SUBMIT_MS = 2000;

const email = z
  .string()
  .min(1, "We need an email address to reply to.")
  .email("That doesn't look like an email address — check for a typo.");

const name = z.string().min(2, "Tell us who to address the reply to.");
const companyName = z.string().min(2, "Which company are you with?");

/**
 * Present on every form.
 *
 * The honeypot deliberately ACCEPTS any string here rather than validating it
 * as empty. If the schema rejected a filled honeypot, the route would return a
 * 400 with a field error naming `companyWebsite` — which tells a bot exactly
 * which field is the trap, and is the opposite of what a honeypot is for.
 * The route inspects it after validation and answers 200 so the bot learns
 * nothing about why it failed.
 */
const antiSpam = {
  /** Honeypot: hidden from sighted users and assistive tech alike. */
  companyWebsite: z.string().optional(),
  startedAt: z.coerce.number(),
};

const base = {
  name,
  email,
  company: companyName,
  phone: z.string().optional(),
  message: z.string().max(4000).optional(),
  ...antiSpam,
};

export const quoteLeadSchema = z.object({
  leadType: z.literal("quote"),
  ...base,
  city: z.string().optional(),
  sku: z.string().optional(),
  application: z.string().optional(),
  volume: z.string().optional(),
  timeline: z.string().optional(),
});

export const exportLeadSchema = z.object({
  leadType: z.literal("export"),
  ...base,
  country: z.string().min(2, "Which country are you importing into?"),
  role: z.enum(["distributor", "importer", "end-user"], {
    errorMap: () => ({ message: "Tell us how you would be working with us." }),
  }),
  productsOfInterest: z.string().optional(),
  annualVolume: z.string().optional(),
  certifications: z.string().optional(),
  incoterms: z.string().optional(),
  regulatorySupport: z.enum(["yes", "no", "unsure"]).optional(),
});

export const downloadLeadSchema = z.object({
  leadType: z.literal("download"),
  email,
  name: name.optional(),
  company: companyName.optional(),
  /** Which document — a TDS request is a materially hotter lead. */
  doc: z.string().min(1),
  ...antiSpam,
});

export const selectorLeadSchema = z.object({
  leadType: z.literal("selector"),
  email,
  name: name.optional(),
  company: companyName.optional(),
  /** The full answer set, so sales sees exactly what the buyer specified. */
  answers: z.record(z.string(), z.string()),
  matches: z.array(z.string()),
  ...antiSpam,
});

export const contactLeadSchema = z.object({
  leadType: z.literal("contact"),
  ...base,
});

export const careersLeadSchema = z.object({
  leadType: z.literal("careers"),
  name,
  email,
  phone: z.string().optional(),
  role: z.string().optional(),
  message: z.string().max(4000).optional(),
  ...antiSpam,
});

/** One route, one discriminated union (Section 10). */
export const leadSchema = z.discriminatedUnion("leadType", [
  quoteLeadSchema,
  exportLeadSchema,
  downloadLeadSchema,
  selectorLeadSchema,
  contactLeadSchema,
  careersLeadSchema,
]);

export type Lead = z.infer<typeof leadSchema>;
export type LeadType = Lead["leadType"];

/** CV upload constraints, enforced server-side by MIME type as well as size. */
export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const CV_ACCEPTED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
