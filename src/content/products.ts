import type { Product, SpecRow } from "./types";

/**
 * The catalogue: product lines (DVS starter cultures), Gir Cow Ghee, dairy
 * ingredients and taste makers.
 * (Counts printed on the site come from src/content/counts.ts, not from here.
 * The coded variants WITHIN each product line live in variants.ts.)
 *
 * SOURCING NOTE — important, read before editing.
 * Phase 2 of the brief asks for the live site's own product descriptions as
 * the copy base. absourcebiologics.com was unreachable from the build
 * environment (egress policy, see CONTENT-TODO.md), so the descriptions here
 * are written from the product name, its application family and the brief —
 * i.e. only from what the SKU self-evidently is. They are deliberately
 * conservative and contain no performance claims.
 *
 * What is NOT invented anywhere in this file:
 *   - No incubation temperature, time, dosage, acidity, pH, shelf life,
 *     pack size or storage condition. Every one of those is a `todo` row.
 *   - No species or genus composition. Marked `todo` on every SKU.
 * The only technical attributes asserted are the ones the brief states as
 * true of the whole range: freeze-dried, phage-resistant, Direct Vat Set,
 * and 24 quality checks.
 *
 * `cultureType` is assigned from the application family using standard dairy
 * microbiology (thermophilic for dahi/yoghurt-type fermentations, mesophilic
 * for buttermilk/cultured cream). It drives catalogue filtering only, never a
 * published claim, and the whole set is flagged for client confirmation in
 * CONTENT-TODO.md.
 */

/** Rows every DVS culture shares. Only brief-supported facts are asserted. */
const DVS_COMMON_SPECS: readonly SpecRow[] = [
  { label: "Format", value: "Direct Vat Set (DVS) — ready to use, no propagation" },
  { label: "Form", value: "Freeze-dried" },
  { label: "Phage resistance", value: "Phage-resistant strains" },
  { label: "Quality release", value: "24 quality checks before release" },
  {
    label: "Pack artwork",
    value:
      "Colour-coded per culture line for the catalogue. Delivered product comes in the standard blue and white ABsource sachet.",
  },
  { label: "Organism composition", todo: "Species/genera present — confirm per SKU with R&D" },
  { label: "Incubation temperature", todo: "Confirm range in degC per SKU" },
  { label: "Incubation time", todo: "Confirm hours to target acidity per SKU" },
  { label: "Recommended dosage", todo: "Confirm units per 100 L milk per SKU" },
  { label: "Target acidity", todo: "Confirm % lactic acid / target pH per SKU" },
  { label: "Packaging sizes", todo: "Confirm sachet/pack sizes offered" },
  { label: "Storage conditions", todo: "Confirm storage temperature" },
  { label: "Shelf life", todo: "Confirm shelf life at stated storage temperature" },
];

/**
 * DVS specs for a culture that ships in its OWN printed sachet rather than the
 * colour-coded catalogue artwork. Same technical rows; the note about the
 * standard blue and white sachet is dropped because it would be false.
 */
const DVS_SPECS_OWN_PACK: readonly SpecRow[] = DVS_COMMON_SPECS.filter(
  (row) => row.label !== "Pack artwork"
);

const INGREDIENT_COMMON_SPECS: readonly SpecRow[] = [
  { label: "Composition", todo: "Confirm declared composition and E-numbers where applicable" },
  { label: "Recommended dosage", todo: "Confirm dosage range and basis" },
  { label: "Application notes", todo: "Confirm process stage and method of addition" },
  { label: "Packaging sizes", todo: "Confirm pack sizes offered" },
  { label: "Storage conditions", todo: "Confirm storage temperature" },
  { label: "Shelf life", todo: "Confirm shelf life at stated storage temperature" },
];

/**
 * Ingredient rows where the client's own pack states the answer.
 *
 * `declared` comes straight off the printed label in the product photograph —
 * the declaration the buyer can read in the image beside it — and replaces the
 * matching "to confirm" row. Anything the label does not state stays a todo.
 */
function ingredientSpecs(
  packSize: string | null,
  declared: readonly { label: string; value: string }[] = []
): readonly SpecRow[] {
  const stated = new Set(declared.map((row) => row.label));
  return [
    ...(packSize ? [{ label: "Pack size", value: packSize }] : []),
    ...declared,
    ...INGREDIENT_COMMON_SPECS.filter(
      (row) => !stated.has(row.label) && !(packSize && row.label === "Packaging sizes")
    ),
  ];
}

/** Applies to every culture SKU. No self-reliance language — Section 13 bans
 *  it on product detail pages outright. */
const VERSUS_IMPORTED_DEFAULT: readonly [string, string, string] = [
  "Manufactured in Pune, so replenishment runs in days rather than the weeks an import cycle takes.",
  "Priced and invoiced in rupees, with no exchange-rate exposure and no import licence step.",
  "The strain blend can be adjusted to your product by the team that makes it — not requested through a distributor.",
];

/**
 * Why the sachets are different colours.
 *
 * The catalogue shows a differently coloured pack per culture line, and a
 * buyer reasonably reads that as "these arrive looking different". They do
 * not: the colour exists so a plant can tell the lines apart on a shelf and in
 * this catalogue, and delivered product ships in the standard blue and white
 * sachet.
 *
 * Deliberately says "sachet", not "pouch". "Pouch" already means two other
 * things here — it is a Culture Selector answer for the DAIRY's own retail
 * pack format (cup / pouch / bucket / bulk), and it is the right noun for the
 * ingredient stand-up packs, which ARE the delivery pack and must not be
 * covered by this note. Using "pouch" on the selector result would read as
 * though it described the answer the buyer had just given.
 *
 * Count-agnostic on purpose: FERMENTA is a culture line with no artwork yet,
 * so "the N product lines" would be wrong the moment you counted packs.
 *
 * CULTURES ONLY. The seven ingredients and the taste maker are photographed as
 * the real stand-up packs they ship in.
 *
 * Says nothing about what is printed on the delivered sachet. The CU01 artwork
 * carries its product code on the face, but that has not been confirmed for the
 * other twelve, and this note is not the place to infer it.
 */
export const packArtworkNote = {
  // Says "culture pack" because on /products this sits above a grid that also
  // holds ingredients and the taste maker, which ship in their own real
  // stand-up packs. Scoping the sentence is better than hiding the note the
  // moment anything else is on screen — the default view is the mixed one.
  catalogue:
    "The colour on each culture pack is there to tell the culture lines apart in the catalogue. Delivered culture comes in the standard blue and white ABsource sachet.",
  detail:
    "This artwork is colour-coded to tell the culture lines apart in the catalogue. Delivered product comes in the standard blue and white ABsource sachet.",
  short:
    "Pack colours tell the range apart. Delivered product comes in the standard blue and white ABsource sachet.",
} as const;

export const products: readonly Product[] = [
  /* ============ PRODUCT LINES — DVS STARTER CULTURES (15) ============ */
  {
    slug: "abdahi",
    name: "ABDAHI",
    strainCode: null,
    category: "cultures",
    cultureType: "thermophilic",
    applications: ["curd-dahi"],
    summary: "Set curd and dahi in cup and bucket formats",
    description:
      "A Direct Vat Set starter culture for set curd and dahi. Supplied freeze-dried for addition straight to the vat, with no in-house propagation step.",
    image: "/assets/products/cultures/abdahi.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abdahi-low-fat",
    name: "ABDAHI LOW FAT",
    strainCode: null,
    category: "cultures",
    cultureType: "thermophilic",
    applications: ["curd-dahi"],
    summary: "Set curd on toned, double-toned and low-fat milk",
    description:
      "A Direct Vat Set starter culture made on reduced fat milk, where body and mouthfeel are harder to hold, achieved by selecting EPS-producing bacterial strains specially designed for low fat milk. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abdahi-low-fat.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abyogurt",
    name: "ABYOGURT",
    strainCode: null,
    category: "cultures",
    cultureType: "thermophilic",
    applications: ["yoghurt"],
    // The live site's ABYOGURT copy ends with the ABDAHI paragraph about cup
    // and bucket curd — a copy-paste error. It is not reproduced here.
    summary: "Set, Greek, fruit and low-fat yoghurt",
    description:
      "A Direct Vat Set yoghurt culture for set, Greek-style, fruit and low-fat yoghurt. Supplied freeze-dried for addition straight to the vat.",
    image: "/assets/products/cultures/abyogurt.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abchach",
    name: "ABCHACH",
    strainCode: null,
    category: "cultures",
    cultureType: "mesophilic",
    applications: ["buttermilk-lassi"],
    summary: "Cultured buttermilk and chach",
    description:
      "A Direct Vat Set mesophilic culture for cultured buttermilk and chach. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abchach.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "ablaban",
    name: "ABLABAN",
    strainCode: null,
    category: "cultures",
    cultureType: "blended",
    applications: ["buttermilk-lassi", "fermented-foods-beverages"],
    summary: "Laban and salted fermented milk drinks",
    description:
      "A Direct Vat Set culture for laban and comparable salted fermented milk drinks. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/ablaban.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abcheese",
    name: "ABCHEESE",
    strainCode: null,
    category: "cultures",
    cultureType: "mesophilic",
    applications: ["cheese-paneer"],
    summary: "Cheese starter across the cheese range",
    description:
      "A Direct Vat Set cheese starter culture. Supplied freeze-dried for direct addition to the cheese vat, removing the bulk-starter propagation step.",
    image: "/assets/products/cultures/abcheese.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "ablassi",
    name: "ABLASSI",
    strainCode: null,
    category: "cultures",
    cultureType: "blended",
    applications: ["buttermilk-lassi"],
    summary: "Sweet and salted lassi",
    description:
      "A Direct Vat Set culture for sweet and salted lassi. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/ablassi.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abmishti",
    name: "ABMISHTI",
    strainCode: null,
    category: "cultures",
    cultureType: "thermophilic",
    applications: ["shrikhand-mishti-doi"],
    summary: "Mishti doi",
    description:
      "A Direct Vat Set culture for mishti doi, the sweetened set curd of eastern India. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abmishti.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abshri",
    name: "ABSHRI",
    strainCode: null,
    category: "cultures",
    cultureType: "thermophilic",
    applications: ["shrikhand-mishti-doi"],
    summary: "Shrikhand and chakka base",
    description:
      "A Direct Vat Set culture for shrikhand and its chakka base. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abshri.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abcream",
    name: "ABCREAM",
    strainCode: null,
    category: "cultures",
    cultureType: "mesophilic",
    applications: ["cultured-ghee-butter"],
    summary: "Cultured cream for butter and cultured ghee",
    description:
      "A Direct Vat Set mesophilic culture for cream, used ahead of butter and cultured ghee production. Supplied freeze-dried for direct addition.",
    image: "/assets/products/cultures/abcream.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    // Formerly ABPROBIO. Renamed by the client, who asked for it to carry
    // ABDAHI's pack: it is presented as the probiotic variant of the dahi line.
    // /products/cultures/abprobio redirects here (next.config.ts).
    slug: "abdahi-probiotic",
    name: "ABDAHI (Probiotic)",
    strainCode: null,
    category: "cultures",
    cultureType: "probiotic",
    // Probiotics & functional ONLY, at the client's instruction. It used to be
    // tagged for curd and yoghurt as well, and so appeared on both of those
    // application pages.
    applications: ["probiotics-functional"],
    summary: "Probiotic cultures for functional dairy",
    description:
      "A Direct Vat Set probiotic culture for functional dairy and fermented products. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abdahi.webp",
    packOf: "abdahi",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abkefir",
    name: "ABKEFIR",
    strainCode: null,
    category: "cultures",
    cultureType: "blended",
    applications: ["fermented-foods-beverages", "probiotics-functional"],
    summary: "Kefir and cultured fermented beverages",
    description:
      "A Direct Vat Set culture for kefir and comparable cultured beverages. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abkefir.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    // Formerly ABBIO-SHIELD. Renamed by the client and given ABSHRI's green
    // pack: it is the shrikhand line with the bioprotective strains built in.
    // /products/cultures/abbio-shield redirects here (next.config.ts).
    slug: "abshri-bio-shield",
    name: "ABSHRI (with ABBIO-Shield)",
    strainCode: null,
    category: "cultures",
    cultureType: "blended",
    // Probiotics & functional ONLY, at the client's instruction.
    applications: ["probiotics-functional"],
    summary: "Shrikhand culture with bioprotective strains",
    // "Extends the shelf life of chakka by three weeks" is the client's own
    // stated figure (feedback of 2026-10-11), published on their word. It is a
    // performance claim with no test data in the repo — CONTENT-TODO.md §0i.
    description:
      "A Direct Vat Set culture for shrikhand and its chakka base, with ABBIO-Shield bioprotective strains that protect the product against spoilage bacteria and moulds. It extends the shelf life of chakka by three weeks. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abshri.webp",
    packOf: "abshri",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },

  {
    /**
     * An idli and dosa batter culture. The description is the client's own
     * wording, and they have stated its technical specification is the same as
     * ABDAHI's, so it takes the DVS rows.
     *
     * Kept late in the cultures block on purpose: productsByApplication()[0]
     * feeds SolutionMedia, and ABKEFIR should stay the lead image for
     * fermented foods and beverages.
     */
    slug: "fermenta",
    name: "FERMENTA",
    strainCode: null,
    category: "cultures",
    cultureType: null,
    applications: ["fermented-foods-beverages"],
    summary: "Idli and dosa batter culture",
    description:
      "A Direct Vat Set starter culture for idli and dosa batter. Supplied freeze-dried for addition straight to the vessel, with no in-house propagation step.",
    // FERMENTA's own printed sachet, supplied by the client — not the
    // colour-coded catalogue artwork the other lines use. See imageKind.
    image: "/assets/products/cultures/fermenta-sachet.webp",
    imageKind: "photo",
    imageBack: "/assets/products/cultures/fermenta-label-back.webp",
    // It ferments batter, so "trial it on your own milk" would be wrong.
    substrate: "batter",
    specs: DVS_SPECS_OWN_PACK,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abvegan",
    name: "ABVEGAN",
    strainCode: null,
    category: "cultures",
    cultureType: null,
    // "vegan" is a catalogue filter, not one of the eight solution families:
    // the client asked for a Vegan application filter showing this product.
    // It still appears under no solution page.
    applications: ["vegan"],
    summary: "New — in pilot, launching soon",
    description:
      "ABVEGAN is a new product offering from ABsource. It is in the early stages of testing and in pilot with a small number of select customers, and will launch and be available soon.",
    // The client's colour-coded sachet for it (October 2026), framed like the
    // other culture sachets. It prints storage and shelf-life lines of its
    // own, as they all do; that is artwork, not a published specification.
    image: "/assets/products/cultures/abvegan.webp",
    // A pilot product is not yet orderable, so nothing here can be sampled or
    // specified. Every CTA and spec block on the detail page keys off this.
    availability: "pilot",
    specs: [],
    // Empty rather than borrowed. "Why this over an imported equivalent" is a
    // set of comparative claims about a product buyers can obtain; ABVEGAN is
    // not obtainable yet, and no comparison has been made.
    versusImported: [],
  },

  /* ============================ GIR COW GHEE ============================ */
  {
    /**
     * AB704, the cream culture for granular ghee, sold in its own right under
     * the category the client asked for. The description is ABCREAM's, at their
     * instruction — it is a variant of that line, and it is also listed there
     * as one (variants.ts). The photograph is its own: the client's Gir Cow
     * Ghee jars, which replaced ABCREAM's sachet (October 2026).
     *
     * No application tags: the client asked for it to appear in this category
     * alone, so it is not surfaced on the cultured ghee solution page.
     */
    slug: "ab704",
    name: "AB704",
    strainCode: null,
    category: "gir-cow-ghee",
    cultureType: "mesophilic",
    applications: [],
    summary: "Cultured cream for butter and cultured ghee",
    description:
      "A Direct Vat Set mesophilic culture for cream, used ahead of butter and cultured ghee production. Supplied freeze-dried for direct addition.",
    // A photograph of the product, not catalogue sachet artwork: it must stay
    // off the 3D sachet model and must not carry the colour-coding note.
    image: "/assets/products/ingredients/ab704-ghee.webp",
    imageKind: "photo",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },

  /* ========================= DAIRY INGREDIENTS ========================= */
  {
    // Formerly ABBIND. Renamed by the client, with new packaging, which they
    // supplied in October 2026. The pack prints the name "AB Maxx" (two x's);
    // the product is named ABMAX at their instruction and that is what the
    // site says. CONTENT-TODO.md §00.
    // /products/ingredients/abbind redirects here.
    slug: "abmax",
    name: "ABMAX",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["curd-dahi", "yoghurt"],
    summary: "Stabiliser system for fermented dairy",
    description:
      "A stabiliser system for fermented dairy products. Full composition and dosage are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abmax-pouch.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    // Formerly ABBINDMAX. Renamed by the client, who supplied the new pouch in
    // October 2026. CONTENT-TODO.md §00.
    // /products/ingredients/abbindmax redirects here.
    slug: "abmerge-plus",
    name: "ABMERGE+",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["curd-dahi", "yoghurt"],
    summary: "Higher-strength stabiliser system",
    description:
      "A higher-strength stabiliser system for fermented dairy where additional body is required. Full composition and dosage are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abmerge-plus-pouch.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abpro",
    name: "ABPRO",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["yoghurt", "probiotics-functional"],
    summary: "Dairy protein ingredient",
    description:
      "A dairy protein ingredient for fortification and body in fermented products. Full composition and dosage are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abpro.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    slug: "abrenno",
    name: "ABRENNO",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["cheese-paneer"],
    // Cheese only. The client asked for the paneer reference to come out
    // everywhere this product is described.
    summary: "Microbial rennet for cheese",
    description:
      "A microbial rennet coagulant for cheese manufacture. Supplied as a powder.",
    image: "/assets/products/ingredients/abrenno.webp",
    // Activity, composition and dosage are read off the printed bottle label.
    specs: ingredientSpecs(null, [
      { label: "Product type", value: "Coagulant — powdered microbial rennet" },
      { label: "Composition", value: "Microbial rennet" },
      { label: "Activity", value: "6000 U/kg" },
      { label: "Recommended dosage", value: "0.02 g per kg of milk" },
    ]),
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    // ABMERGE is sold in two pack sizes, listed as two SKUs at the client's
    // request. Same product and the same specification; only the pack differs.
    // The product code, declaration and what it is for are read off the printed
    // 25 kg bag, which states a single ingredient — so the old "functional
    // blend" wording was dropped. The yield claim on the bag is NOT repeated.
    // /products/ingredients/abmerge redirects to this one.
    slug: "abmerge-1kg",
    name: "ABMERGE (1 kg pouch)",
    strainCode: "AB/ACR/001",
    category: "ingredients",
    cultureType: null,
    applications: ["cheese-paneer", "curd-dahi"],
    summary: "Acidity regulator for paneer",
    description:
      "A glucono-delta-lactone acidity regulator for dairy processing, used in paneer making. Dosage and method of addition are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abmerge-1kg.webp",
    specs: ingredientSpecs("1 kg pouch", [
      { label: "Product type", value: "Acidity regulator, sequestrant, leavening agent" },
      { label: "Composition", value: "Glucono-delta-lactone (INS 575)" },
    ]),
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    // The 25 kg bag of the same product. See the 1 kg entry above.
    slug: "abmerge-25kg",
    name: "ABMERGE (25 kg bag)",
    strainCode: "AB/ACR/001",
    category: "ingredients",
    cultureType: null,
    applications: ["cheese-paneer", "curd-dahi"],
    summary: "Acidity regulator for paneer",
    description:
      "A glucono-delta-lactone acidity regulator for dairy processing, used in paneer making. Dosage and method of addition are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abmerge-25kg.webp",
    specs: ingredientSpecs("25 kg bag", [
      { label: "Product type", value: "Acidity regulator, sequestrant, leavening agent" },
      { label: "Composition", value: "Glucono-delta-lactone (INS 575)" },
    ]),
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },

  /* =========================== TASTE MAKERS =========================== */
  {
    // ABSPICE is sold in two pack sizes, listed as two SKUs at the client's
    // request. Same product and the same specification; only the pack differs.
    // /products/taste-makers/abspice redirects to this one.
    slug: "abspice-1kg",
    name: "ABSPICE (1 kg pouch)",
    strainCode: "AB/SPC/001",
    category: "taste-makers",
    cultureType: null,
    applications: ["buttermilk-lassi", "fermented-foods-beverages"],
    summary: "Savoury seasoning system for dairy",
    description:
      "A savoury seasoning system for dairy applications such as spiced chach and savoury fermented drinks. Full composition is supplied on the technical data sheet.",
    image: "/assets/products/taste-makers/abspice-1kg.webp",
    specs: ingredientSpecs("1 kg pouch", [
      { label: "Product type", value: "Chach masala" },
      { label: "Composition", value: "Mixture of spices and table salt" },
    ]),
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
  {
    // The 25 kg bag of the same product. See the 1 kg entry above.
    slug: "abspice-25kg",
    name: "ABSPICE (25 kg bag)",
    strainCode: "AB/SPC/001",
    category: "taste-makers",
    cultureType: null,
    applications: ["buttermilk-lassi", "fermented-foods-beverages"],
    summary: "Savoury seasoning system for dairy",
    description:
      "A savoury seasoning system for dairy applications such as spiced chach and savoury fermented drinks. Full composition is supplied on the technical data sheet.",
    image: "/assets/products/taste-makers/abspice-25kg.webp",
    specs: ingredientSpecs("25 kg bag", [
      { label: "Product type", value: "Chach masala" },
      { label: "Composition", value: "Mixture of spices and table salt" },
    ]),
    versusImported: VERSUS_IMPORTED_DEFAULT,
  },
];

/* --- Derived lookups ----------------------------------------------------- */

export const cultures = products.filter((p) => p.category === "cultures");
export const ingredients = products.filter((p) => p.category === "ingredients");
export const tasteMakers = products.filter((p) => p.category === "taste-makers");
export const girCowGhee = products.filter((p) => p.category === "gir-cow-ghee");

/**
 * Product codes are no longer carried on the product.
 *
 * A code (AB436NX) identifies a variant WITHIN a product line, not the
 * line itself — several codes are all ways of buying ABDAHI. They live in
 * src/content/variants.ts, keyed to the product they are ordered against, and
 * the rail reads them from there.
 *
 * `strainCode` is a code for the WHOLE product, where the client's pack prints
 * one. That is true of the ingredients and the taste maker (AB/ACR/001,
 * AB/SPC/001) and of no culture line, whose codes are per variant and live in
 * variants.ts. Every consumer guards on null.
 */

export function productBySlug(
  category: string,
  slug: string
): Product | undefined {
  return products.find((p) => p.category === category && p.slug === slug);
}

export function productsByApplication(tag: string): readonly Product[] {
  return products.filter((p) =>
    (p.applications as readonly string[]).includes(tag)
  );
}

/** The client's stated size of the culture portfolio. Also exported by counts.ts. */
export const CULTURES_OFFERED_LABEL = "200+";

/**
 * How each category is named, in the three places it appears.
 *
 * The culture range used to be labelled "DVS starter cultures". The client
 * calls it "Product lines" and wants the DVS descriptor in brackets with the
 * size of the portfolio beside it, because the range is 200+ cultures and the
 * old label read as a single product type. That reads well as a filter or a
 * navigation entry and badly repeated on every catalogue card, so the label
 * comes in three lengths:
 *
 *   name    — the plural noun. Breadcrumbs, structured data, anywhere short.
 *   filter  — the full label, with the descriptor and the size of the range.
 *             Filter chips and headings, where there is room and where the
 *             reader is deciding what to look at.
 *   item    — per product. "Product line (DVS starter culture)", singular,
 *             because ABDAHI is a product line, and without the "200+" because
 *             repeating a portfolio size on fifteen cards is noise.
 *
 * Only the culture category changed. Ingredients and taste makers keep their
 * existing wording in all three.
 */
export const CATEGORY_COPY: Record<
  string,
  { name: string; filter: string; item: string }
> = {
  cultures: {
    name: "Product lines",
    filter: `Product lines (DVS starter cultures · ${CULTURES_OFFERED_LABEL})`,
    item: "Product line (DVS starter culture)",
  },
  "gir-cow-ghee": {
    name: "Gir Cow Ghee",
    filter: "Gir Cow Ghee",
    item: "Gir Cow Ghee",
  },
  ingredients: {
    name: "Dairy ingredients",
    filter: "Dairy ingredients",
    item: "Dairy ingredients",
  },
  "taste-makers": {
    name: "Taste makers",
    filter: "Taste makers",
    item: "Taste makers",
  },
};

/** The short plural names. Kept as its own export because it is imported widely. */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_COPY).map(([key, copy]) => [key, copy.name])
);

export const CULTURE_TYPE_LABELS: Record<string, string> = {
  thermophilic: "Thermophilic",
  mesophilic: "Mesophilic",
  blended: "Blended",
  probiotic: "Probiotic",
};
