import type { Service } from "./types";

/**
 * Three services. Engagement here genuinely is a sequence, so numbered steps
 * are the correct treatment — unlike the challenge/response table, where the
 * rows are parallel and numbering would misrepresent them.
 */
export const services: readonly Service[] = [
  {
    slug: "custom-culture-development",
    name: "Custom culture development",
    summary:
      "New culture blends built from scratch to your product spec, by the people who manufacture them.",
    forWhom:
      "Any producer whose target product does not map cleanly onto an existing SKU — a creamier dahi, a sharper cheese, a fermented beverage that does not exist yet.",
    includes: [
      "A working session on your product spec: target texture, acidity, flavour direction and process constraints",
      "Strain screening and blend development in our R&D lab",
      "Trial quantities for plant trials on your own milk",
      "Iteration against your trial results",
      "Scale-up to commercial supply once the blend performs",
    ],
    process: [
      { step: "Describe the product", detail: "What you are trying to make, and what is wrong with what you can currently buy." },
      { step: "Spec and feasibility", detail: "We confirm what is achievable and where the constraints sit." },
      { step: "Lab development", detail: "Strain screening and blend development against your target." },
      { step: "Plant trial", detail: "Trial quantities on your own milk and your own process." },
      { step: "Iterate", detail: "Adjust the blend against what the trial actually produced." },
      { step: "Commercial supply", detail: "Scale to your volumes on a regular schedule." },
    ],
  },
  {
    slug: "turnkey-plant-setup",
    name: "Turnkey plant setup",
    summary:
      "Consultancy to build or optimise a dairy processing facility, from layout through commissioning.",
    forWhom:
      "New entrants building a first plant, and established producers adding a line or a category.",
    includes: [
      "Facility layout and process flow",
      "Equipment specification and vendor evaluation",
      "Process design for the products you intend to make",
      "Commissioning support and process validation",
      "Operator training on culture handling",
    ],
    process: [
      { step: "Scope", detail: "Products, volumes, site and budget." },
      { step: "Design", detail: "Process flow, layout and equipment specification." },
      { step: "Procure", detail: "Vendor evaluation and specification support." },
      { step: "Commission", detail: "Installation support and process validation." },
      { step: "Handover", detail: "Operator training and a working production process." },
    ],
  },
  {
    slug: "custom-product-development",
    name: "Custom product development",
    summary:
      "The finished dairy product developed end to end — recipe, process and culture together — not just the culture that goes into it.",
    forWhom:
      "Producers launching a product rather than reformulating one: a new dahi variant for a new market, a fermented beverage, a cheese the line has never run.",
    /**
     * Distinct from custom culture development, and the distinction matters
     * commercially. That service ends at a blend that performs. This one owns
     * the product: the recipe around the blend, the process parameters to make
     * it repeatable, and the shelf-life behaviour it has to survive.
     */
    includes: [
      "Product concept worked up against your market and your price point",
      "Recipe development — milk standardisation, solids, stabiliser and culture together",
      "The culture blend selected or developed to suit that recipe",
      "Process parameters: incubation, cooling, packing and the limits on each",
      "Shelf-life and stability behaviour across your distribution chain",
      "Pilot batches, then scale-up on your own line",
    ],
    process: [
      { step: "The brief", detail: "The product you want to sell, who buys it and what it has to cost." },
      { step: "Formulation", detail: "Recipe and culture developed together in our R&D lab." },
      { step: "Pilot", detail: "Small batches, assessed against the brief rather than against a spec sheet." },
      { step: "Plant trial", detail: "The formulation run on your own line, at your own volumes." },
      { step: "Stabilise", detail: "Process parameters fixed, shelf life confirmed, limits documented." },
      { step: "Launch support", detail: "Commercial supply of the culture, and support through the first production runs." },
    ],
  },
];

export function serviceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
