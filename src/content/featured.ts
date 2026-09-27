/**
 * Cultures the client wants pulled out of the catalogue and shown on their own.
 *
 * The brief named three — AB704, the vegan cultures, and FERMENTA. Only
 * FERMENTA is here: no specification arrived for the other two, and a featured
 * slot is the worst place on the site to put a name with nothing behind it.
 * Both are stubbed below, commented out, with exactly the fields they need —
 * fill them in and they appear. Tracked in CONTENT-TODO.md §0f.
 *
 * `status` is what keeps this honest. "in-range" means the SKU is orderable
 * and its page carries a real specification; "spec-on-request" means the line
 * exists and the specification is confirmed against your product before a
 * sample ships. Nothing here fabricates composition, dosage or a claim.
 */

export type FeaturedCulture = {
  readonly slug: string;
  readonly name: string;
  /** Short label above the name — what makes it worth featuring. */
  readonly kicker: string;
  readonly summary: string;
  readonly body: string;
  readonly status: "in-range" | "spec-on-request";
  /** Where the card goes. A product page, never a code. */
  readonly href: string;
};

export const featuredIntro = {
  eyebrow: "Featured",
  title: "Three lines we are asked about by name.",
  lede: "Outside the main dahi and yoghurt ranges, these are developed against a specific brief rather than a taste profile.",
} as const;

export const featuredCultures: readonly FeaturedCulture[] = [
  {
    slug: "fermenta",
    name: "FERMENTA",
    kicker: "Specification confirmed per application",
    summary: "Specification available on request",
    body: "Part of the ABsource range, and the line most often asked for by name without a catalogue reference. We confirm its specification against your product and your process, so it goes out with the sample rather than being published here.",
    status: "spec-on-request",
    href: "/products/cultures/fermenta",
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
  // {
  //   slug: "vegan",
  //   name: "Vegan cultures",
  //   kicker: "…",
  //   summary: "…",
  //   body: "…",
  //   status: "in-range",
  //   href: "/products/cultures/vegan",
  // },
];

/**
 * The heading adapts to how many are actually published, so featuring one line
 * does not render a section titled "three lines" with one card under it.
 */
export function featuredTitle(count: number): string {
  if (count === 1) return "One line we are asked about by name.";
  if (count === 2) return "Two lines we are asked about by name.";
  return "Lines we are asked about by name.";
}
