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
    slug: "microbiology-testing",
    name: "Microbiology testing",
    summary:
      "Product safety and quality testing for dairy manufacturers, run in our own lab.",
    forWhom:
      "Producers who need testing capacity they do not have in-house, and anyone validating a new product before launch.",
    includes: [
      "Product safety testing",
      "Culture viability and count verification",
      "Shelf-life studies",
      "Contamination investigation when a batch fails",
    ],
    process: [
      { step: "Define the question", detail: "What you need to know, and what decision rests on it." },
      { step: "Sampling plan", detail: "What to send, how much, and how to transport it." },
      { step: "Testing", detail: "Run in our in-process QC lab." },
      { step: "Report", detail: "Results with an interpretation you can act on, not just a number." },
    ],
  },
];

export function serviceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
