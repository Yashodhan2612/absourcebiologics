/**
 * Cultures the client wants pulled out of the catalogue and shown on their own.
 *
 * The brief named three — AB704, the vegan cultures, and FERMENTA. FERMENTA and
 * ABVEGAN are here. AB704 is not: no specification arrived, and a featured slot
 * is the worst place on the site to put a name with nothing behind it. It is
 * stubbed below, commented out, with exactly the fields it needs — fill it in
 * and it appears. Tracked in CONTENT-TODO.md §0f.
 *
 * `status` is what keeps this honest, and each value maps to a product state:
 *   "in-range"        orderable, and its page carries a real specification.
 *   "spec-on-request" the line exists; the specification is confirmed against
 *                     your product before a sample ships.
 *   "pilot"           not yet orderable. In testing with select customers and
 *                     launching soon — the card says so and offers interest
 *                     registration, never a sample or a specification.
 * Nothing here fabricates composition, dosage or a claim.
 *
 * The section's own copy makes no claim about how often anything is asked for.
 * An earlier version said FERMENTA was "most often asked for by name". Nothing
 * supported that, and it cannot be said of a product that has not launched.
 */

export type FeaturedCulture = {
  readonly slug: string;
  readonly name: string;
  /** Short label above the name — what makes it worth featuring. */
  readonly kicker: string;
  readonly summary: string;
  readonly body: string;
  readonly status: "in-range" | "spec-on-request" | "pilot";
  /** Where the card goes. A product page, never a code. */
  readonly href: string;
};

export const featuredIntro = {
  eyebrow: "Featured",
  lede: "Outside the main dahi and yoghurt ranges.",
} as const;

export const featuredCultures: readonly FeaturedCulture[] = [
  {
    slug: "fermenta",
    name: "FERMENTA",
    kicker: "Specification confirmed per application",
    summary: "Specification available on request",
    body: "Part of the ABsource range. We confirm its specification against your product and your process, so it goes out with the sample rather than being published here.",
    status: "spec-on-request",
    href: "/products/cultures/fermenta",
  },
  {
    slug: "abvegan",
    name: "ABVEGAN",
    kicker: "New · in pilot",
    summary: "Launching soon",
    body: "A new product offering, currently in early stages of testing and pilot with select customers. It will launch and be available soon.",
    status: "pilot",
    href: "/products/cultures/abvegan",
  },
  // {
  //   slug: "ab704",
  //   name: "AB704",
  //   kicker: "…",
  //   summary: "…",
  //   body: "…",
  //   status: "in-range",
  //   href: "/products/cultures/ab704",
  // },
];

/**
 * The heading adapts to how many are actually published, so featuring two lines
 * does not render a section titled "three lines" with two cards under it.
 */
export function featuredTitle(count: number): string {
  if (count === 1) return "One line to know about.";
  if (count === 2) return "Two lines to know about.";
  if (count === 3) return "Three lines to know about.";
  return "Lines to know about.";
}
