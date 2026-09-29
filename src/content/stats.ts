/**
 * Every number on the site goes through this file.
 *
 * Why it is shaped this way: the live WordPress site renders "0 +" for Years,
 * Countries and Customers, so a buyer's first impression is a company with
 * zero customers. Making `verified` part of the type means an unverified stat
 * cannot reach the page — <Stat> returns null and the tile is omitted entirely
 * rather than falling back to a zero or a guess (Section 3).
 *
 * Figures come from the client's own brand documents (Oct 2025 revision).
 * Do not add an entry here without a source.
 */

import { cultures } from "./products";

export type StatEntry =
  | {
      readonly value: number;
      readonly verified: true;
      readonly display?: string;
      readonly note?: string;
    }
  | {
      readonly value: number;
      readonly verified: false;
      readonly display?: string;
      readonly todo: string;
    };

export const stats = {
  /** Founded 2014. Derived, so it cannot go stale — see yearsSince(). */
  yearsEstablished: { value: 2014, verified: true, note: "Founded 2014" },
  /** First commercial DVS range launched 2016. */
  yearsCommercial: { value: 2016, verified: true, note: "First commercial DVS range 2016" },
  customersServed: { value: 300, verified: true, display: "300+" },
  countriesServed: {
    value: 5,
    verified: false,
    display: "5+",
    todo:
      "'More than 5 countries' reads small beside '300+ customers' and undercuts /export. " +
      "Get the real current count from the client, or drop the stat from the homepage and let " +
      "/export list named markets instead. Deliberately unverified so it does not render " +
      "anywhere until that decision is made. Do not inflate it.",
  },
  /**
   * Derived, not typed in. A hardcoded count silently disagrees with the
   * catalogue the moment a SKU is added — which is exactly what happened when
   * FERMENTA arrived and this said 13 while /products listed 14, and would
   * have happened again with ABVEGAN.
   *
   * Counts PRODUCT LINES, the client's term for the culture range. The count
   * includes ABVEGAN, which is in pilot and not yet orderable: the client
   * specified fifteen lines and that the new one is announced as coming soon,
   * so the number is honest and the card says what state it is in.
   *
   * The coded cultures within the lines (around forty, in
   * src/content/cultures.ts) are a different number and are never conflated
   * with this one — see culturesOffered.
   */
  productLines: { value: cultures.length, verified: true },
  /**
   * "200+ cultures". CLIENT-STATED, not derivable.
   *
   * Source: the client's instruction of 2026-09-29 to emphasise that ABsource
   * has "200+ cultures", added on their word. The catalogue cannot confirm it:
   * src/content/cultures.ts lists roughly forty coded cultures because only
   * the curd and yoghurt families have been supplied (CONTENT-TODO §0c). The
   * gap is a gap in what has been transcribed, not evidence against the claim,
   * but it is the reason this is shown as "200+" and never as a precise figure.
   *
   * Never print "200+" as a literal anywhere else. Import this, or
   * CULTURES_OFFERED_LABEL from counts.ts, so there is one place to change it
   * when the client sends a firmer number.
   */
  culturesOffered: {
    value: 200,
    verified: true,
    display: "200+",
    note: "Client-stated portfolio size; not derivable from the transcribed catalogue.",
  },
  qualityChecks: { value: 24, verified: true },
  flavourPortfolio: {
    value: 8000,
    verified: false,
    display: "8000+",
    todo:
      "The live Taste Maker page claims 8000+ flavours. Confirm this is ABsource's own range " +
      "and not a sourcing partner's catalogue before publishing.",
  },
} as const satisfies Record<string, StatEntry>;

/** Years elapsed since a founding year, so no hardcoded age can go stale. */
export function yearsSince(year: number, now: Date = new Date()): number {
  return now.getFullYear() - year;
}

export const FOUNDED_YEAR = 2014;
export const FIRST_COMMERCIAL_YEAR = 2016;

/**
 * Build-time warning listing every unverified stat, so these cannot be
 * quietly forgotten before launch (Section 3).
 */
export function warnUnverifiedStats(): void {
  const unverified = Object.entries(stats).filter(([, s]) => !s.verified);
  if (unverified.length === 0) return;
  console.warn(
    `\n[ABsource] ${unverified.length} unverified stat(s) will NOT render:\n` +
      unverified
        .map(([k, s]) => `  - ${k}: ${"todo" in s ? s.todo : "no rationale given"}`)
        .join("\n") +
      "\n"
  );
}
