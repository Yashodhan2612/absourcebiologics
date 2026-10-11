/**
 * Cultures the client wants pulled out of the catalogue and shown on their own.
 *
 * The brief named three — AB704, the vegan cultures, and FERMENTA — and all
 * three are here now. AB704 was held back until it had a page with something
 * behind it; it is now a product in its own right under Gir Cow Ghee.
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
    kicker: "Idli and dosa batter",
    summary: "A Direct Vat Set starter culture for idli and dosa batter",
    body: "Supplied freeze-dried for addition straight to the vessel, with no in-house propagation step.",
    status: "in-range",
    href: "/products/cultures/fermenta",
  },
  {
    slug: "ab704",
    name: "AB704",
    kicker: "Gir Cow Ghee",
    summary: "The cream culture for cultured ghee",
    body: "A Direct Vat Set mesophilic culture for cream, used ahead of butter and cultured ghee production. Supplied freeze-dried for direct addition.",
    status: "in-range",
    href: "/products/gir-cow-ghee/ab704",
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
