import type { Product, SpecRow } from "./types";

/**
 * The 22 SKUs: 14 culture lines, 7 dairy ingredients, 1 taste maker.
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
 * For a SKU that is in the range but whose specification has not reached us.
 *
 * Deliberately NOT DVS_COMMON_SPECS. That array asserts four things — Direct
 * Vat Set, freeze-dried, phage-resistant, 24 quality checks — which are true of
 * the DVS range as a whole and so are safe on a SKU we have data for. Asserting
 * them on a product whose category we are still confirming would be inventing
 * product data, which this file does not do. Every row here is a `todo`, so the
 * spec table shows them as available on the data sheet and claims nothing.
 */
const UNSPECIFIED_COMMON_SPECS: readonly SpecRow[] = [
  { label: "Format", todo: "Confirm whether supplied as Direct Vat Set" },
  { label: "Form", todo: "Confirm physical form (freeze-dried powder, granule, liquid)" },
  { label: "Composition", todo: "Confirm declared composition — organisms and/or ingredients" },
  { label: "Recommended dosage", todo: "Confirm dosage and basis" },
  { label: "Application notes", todo: "Confirm process stage and method of addition" },
  { label: "Packaging sizes", todo: "Confirm pack sizes offered" },
  { label: "Storage conditions", todo: "Confirm storage temperature" },
  { label: "Shelf life", todo: "Confirm shelf life at stated storage temperature" },
];

const INGREDIENT_COMMON_SPECS: readonly SpecRow[] = [
  { label: "Composition", todo: "Confirm declared composition and E-numbers where applicable" },
  { label: "Recommended dosage", todo: "Confirm dosage range and basis" },
  { label: "Application notes", todo: "Confirm process stage and method of addition" },
  { label: "Packaging sizes", todo: "Confirm pack sizes offered" },
  { label: "Storage conditions", todo: "Confirm storage temperature" },
  { label: "Shelf life", todo: "Confirm shelf life at stated storage temperature" },
];

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
 * Count-agnostic on purpose: ABFERMENTA is a culture line with no artwork yet,
 * so "the fourteen culture lines" would be wrong the moment you counted packs.
 *
 * CULTURES ONLY. The seven ingredients and the taste maker are photographed as
 * the real stand-up packs they ship in.
 *
 * Says nothing about what is printed on the delivered sachet. The CU01 artwork
 * carries its strain code on the face, but that has not been confirmed for the
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
  /* ===================== DVS STARTER CULTURES (14) ===================== */
  {
    slug: "abdahi",
    name: "ABDAHI",
    strainCode: "CU01",
    category: "cultures",
    cultureType: "thermophilic",
    applications: ["curd-dahi"],
    summary: "Set curd and dahi in cup and bucket formats",
    description:
      "A Direct Vat Set starter culture for set curd and dahi. Supplied freeze-dried for addition straight to the vat, with no in-house propagation step.",
    image: "/assets/products/cultures/abdahi.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["curd-dahi"],
      packFormats: ["cup", "pouch", "bucket", "bulk"],
      milkFat: ["full-fat", "toned"],
      acidity: ["mild", "medium"],
      texture: ["firm-set"],
      flavour: ["clean", "sweet-mild"],
      probiotic: false,
      batchSizes: ["500-5000", "5000-50000", "over-50000"],
      rationale: "Thermophilic starter intended for firm-set curd in cup and bucket packs.",
      caveats: ["Confirm your incubation capacity before trialling a thermophilic blend."],
    },
  },
  {
    slug: "abdahi-low-fat",
    name: "ABDAHI LOW FAT",
    strainCode: "LF01",
    category: "cultures",
    cultureType: "thermophilic",
    applications: ["curd-dahi"],
    summary: "Set curd on toned, double-toned and low-fat milk",
    description:
      "A Direct Vat Set starter culture for curd made on reduced-fat milk, where body and mouthfeel are harder to hold. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abdahi-low-fat.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["curd-dahi"],
      packFormats: ["cup", "pouch", "bucket", "bulk"],
      milkFat: ["toned", "double-toned", "low-fat"],
      acidity: ["mild", "medium"],
      texture: ["firm-set", "thick"],
      flavour: ["clean"],
      probiotic: false,
      batchSizes: ["500-5000", "5000-50000", "over-50000"],
      rationale: "Built for reduced-fat curd, where body is the usual failure mode.",
      caveats: ["Confirm your incubation capacity before trialling a thermophilic blend."],
    },
  },
  {
    slug: "abyogurt",
    name: "ABYOGURT",
    strainCode: "YC01",
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
    selectorProfile: {
      making: ["yoghurt"],
      packFormats: ["cup", "pouch", "bucket", "bulk"],
      milkFat: ["full-fat", "toned", "double-toned", "low-fat"],
      acidity: ["medium", "sharp"],
      texture: ["firm-set", "creamy", "stirred", "thick"],
      flavour: ["clean", "sharp-tangy"],
      probiotic: false,
      batchSizes: ["500-5000", "5000-50000", "over-50000"],
      rationale: "Covers the full yoghurt range — set, Greek, fruit and low-fat.",
      caveats: ["Confirm your incubation capacity before trialling a thermophilic blend."],
    },
  },
  {
    slug: "abchach",
    name: "ABCHACH",
    strainCode: "BU01",
    category: "cultures",
    cultureType: "mesophilic",
    applications: ["buttermilk-lassi"],
    summary: "Cultured buttermilk and chach",
    description:
      "A Direct Vat Set mesophilic culture for cultured buttermilk and chach. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abchach.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["buttermilk-chach"],
      packFormats: ["pouch", "bulk"],
      milkFat: ["toned", "double-toned", "low-fat"],
      acidity: ["medium", "sharp"],
      texture: ["stirred"],
      flavour: ["buttery", "sharp-tangy"],
      probiotic: false,
      batchSizes: ["500-5000", "5000-50000", "over-50000"],
      rationale: "Mesophilic culture for pourable cultured buttermilk and chach.",
      caveats: [],
    },
  },
  {
    slug: "ablaban",
    name: "ABLABAN",
    strainCode: "LB01",
    category: "cultures",
    cultureType: "blended",
    applications: ["buttermilk-lassi", "fermented-foods-beverages"],
    summary: "Laban and salted fermented milk drinks",
    description:
      "A Direct Vat Set culture for laban and comparable salted fermented milk drinks. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/ablaban.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["buttermilk-chach", "other-fermented"],
      packFormats: ["pouch", "bulk"],
      milkFat: ["full-fat", "toned"],
      acidity: ["medium", "sharp"],
      texture: ["stirred", "thick"],
      flavour: ["sharp-tangy", "clean"],
      probiotic: false,
      batchSizes: ["500-5000", "5000-50000"],
      rationale: "Intended for laban-style salted fermented milk drinks.",
      caveats: [],
    },
  },
  {
    slug: "abcheese",
    name: "ABCHEESE",
    strainCode: "CH01",
    category: "cultures",
    cultureType: "mesophilic",
    applications: ["cheese-paneer"],
    summary: "Cheese starter across the cheese range",
    description:
      "A Direct Vat Set cheese starter culture. Supplied freeze-dried for direct addition to the cheese vat, removing the bulk-starter propagation step.",
    image: "/assets/products/cultures/abcheese.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["cheese"],
      packFormats: ["bulk"],
      milkFat: ["full-fat", "toned"],
      acidity: ["medium", "sharp"],
      texture: ["firm-set"],
      flavour: ["clean", "sharp-tangy", "buttery"],
      probiotic: false,
      batchSizes: ["500-5000", "5000-50000", "over-50000"],
      rationale: "Cheese starter for vat addition without bulk-starter preparation.",
      caveats: ["Confirm the target cheese variety with a technologist — the range spans several styles."],
    },
  },
  {
    slug: "ablassi",
    name: "ABLASSI",
    strainCode: "LA01",
    category: "cultures",
    cultureType: "blended",
    applications: ["buttermilk-lassi"],
    summary: "Sweet and salted lassi",
    description:
      "A Direct Vat Set culture for sweet and salted lassi. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/ablassi.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["lassi"],
      packFormats: ["cup", "pouch", "bulk"],
      milkFat: ["full-fat", "toned"],
      acidity: ["mild", "medium"],
      texture: ["stirred", "thick", "creamy"],
      flavour: ["sweet-mild", "clean"],
      probiotic: false,
      batchSizes: ["500-5000", "5000-50000", "over-50000"],
      rationale: "Tuned for lassi, where a mild acid profile keeps the drink sweet.",
      caveats: [],
    },
  },
  {
    slug: "abmishti",
    name: "ABMISHTI",
    strainCode: "MD01",
    category: "cultures",
    cultureType: "thermophilic",
    applications: ["shrikhand-mishti-doi"],
    summary: "Mishti doi",
    description:
      "A Direct Vat Set culture for mishti doi, the sweetened set curd of eastern India. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abmishti.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["mishti-doi"],
      packFormats: ["cup", "bucket"],
      milkFat: ["full-fat"],
      acidity: ["mild"],
      texture: ["firm-set", "creamy"],
      flavour: ["sweet-mild"],
      probiotic: false,
      batchSizes: ["under-500", "500-5000", "5000-50000"],
      rationale: "Built for mishti doi specifically — a mild acid profile that suits a sweetened set.",
      caveats: ["Confirm your incubation capacity before trialling a thermophilic blend."],
    },
  },
  {
    slug: "abshri",
    name: "ABSHRI",
    strainCode: "SH01",
    category: "cultures",
    cultureType: "thermophilic",
    applications: ["shrikhand-mishti-doi"],
    summary: "Shrikhand and chakka base",
    description:
      "A Direct Vat Set culture for shrikhand and its chakka base. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abshri.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["shrikhand"],
      packFormats: ["cup", "bucket", "bulk"],
      milkFat: ["full-fat"],
      acidity: ["mild", "medium"],
      texture: ["thick", "creamy"],
      flavour: ["sweet-mild", "clean"],
      probiotic: false,
      batchSizes: ["under-500", "500-5000", "5000-50000"],
      rationale: "Intended for the chakka base that shrikhand is built on.",
      caveats: ["Confirm your incubation capacity before trialling a thermophilic blend."],
    },
  },
  {
    slug: "abcream",
    name: "ABCREAM",
    strainCode: "CR01",
    category: "cultures",
    cultureType: "mesophilic",
    applications: ["cultured-ghee-butter"],
    summary: "Cultured cream for butter and cultured ghee",
    description:
      "A Direct Vat Set mesophilic culture for cream, used ahead of butter and cultured ghee production. Supplied freeze-dried for direct addition.",
    image: "/assets/products/cultures/abcream.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["cultured-ghee"],
      packFormats: ["bulk"],
      milkFat: ["full-fat"],
      acidity: ["mild", "medium"],
      texture: ["creamy"],
      flavour: ["buttery"],
      probiotic: false,
      batchSizes: ["500-5000", "5000-50000", "over-50000"],
      rationale: "Mesophilic cream culture for a buttery, diacetyl-forward profile.",
      caveats: [],
    },
  },
  {
    slug: "abprobio",
    name: "ABPROBIO",
    strainCode: "PB01",
    category: "cultures",
    cultureType: "probiotic",
    // curd-dahi and yoghurt are declared because selectorProfile.making already
    // recommends this SKU for both. Without them the selector suggested a
    // culture that then did not appear under "What we would trial" on either
    // solution page, and carried no application chip on its own detail page.
    applications: ["probiotics-functional", "curd-dahi", "yoghurt"],
    summary: "Probiotic cultures for functional dairy",
    description:
      "A Direct Vat Set probiotic culture for functional dairy and fermented products. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abprobio.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["probiotic-functional", "curd-dahi", "yoghurt"],
      packFormats: ["cup", "pouch", "bulk"],
      milkFat: ["full-fat", "toned", "double-toned", "low-fat"],
      acidity: ["mild", "medium"],
      texture: ["creamy", "stirred", "firm-set"],
      flavour: ["clean", "sweet-mild"],
      probiotic: true,
      batchSizes: ["under-500", "500-5000", "5000-50000"],
      rationale: "The line to trial when the product carries a probiotic claim.",
      caveats: [
        "A probiotic claim has labelling and viable-count implications — confirm the claim wording and end-of-shelf-life counts with a technologist before launch.",
      ],
    },
  },
  {
    slug: "abkefir",
    name: "ABKEFIR",
    strainCode: "KF01",
    category: "cultures",
    cultureType: "blended",
    applications: ["fermented-foods-beverages", "probiotics-functional"],
    summary: "Kefir and cultured fermented beverages",
    description:
      "A Direct Vat Set culture for kefir and comparable cultured beverages. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abkefir.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["kefir", "other-fermented"],
      packFormats: ["pouch", "bulk"],
      milkFat: ["full-fat", "toned", "low-fat"],
      acidity: ["medium", "sharp"],
      texture: ["stirred"],
      flavour: ["sharp-tangy", "clean"],
      probiotic: true,
      batchSizes: ["under-500", "500-5000", "5000-50000"],
      rationale: "For kefir and cultured drinks rather than a set product.",
      caveats: ["Kefir fermentations behave differently from a standard set culture — plan a trial batch."],
    },
  },
  {
    slug: "abbio-shield",
    name: "ABBIO-SHIELD",
    strainCode: "BS01",
    category: "cultures",
    cultureType: "blended",
    // As ABPROBIO: making already recommends it for curd and yoghurt.
    applications: [
      "probiotics-functional",
      "fermented-foods-beverages",
      "curd-dahi",
      "yoghurt",
    ],
    summary: "Bioprotective culture for fermented dairy",
    description:
      "A Direct Vat Set bioprotective culture used alongside a primary starter. Supplied freeze-dried for direct addition to the vat.",
    image: "/assets/products/cultures/abbio-shield.webp",
    specs: DVS_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: {
      making: ["other-fermented", "curd-dahi", "yoghurt"],
      packFormats: ["cup", "pouch", "bucket", "bulk"],
      milkFat: ["full-fat", "toned", "double-toned", "low-fat"],
      acidity: ["mild", "medium", "sharp"],
      texture: ["firm-set", "creamy", "stirred", "thick"],
      flavour: ["clean"],
      probiotic: false,
      batchSizes: ["500-5000", "5000-50000", "over-50000"],
      rationale: "Runs alongside a primary starter rather than replacing it.",
      caveats: ["This is an adjunct culture — pair it with a primary starter, do not substitute."],
    },
  },

  {
    /**
     * Added at the client's request ("Fermenta needs to be added to the
     * product list"). Everything except the name is unconfirmed, and the repo
     * had no trace of this SKU — it is not on the live site either, so there
     * was no existing copy to work from.
     *
     * Placed LAST in the cultures block on purpose: productsByApplication()[0]
     * feeds SolutionMedia, so a SKU with no pack artwork must not sit earlier
     * and become the lead image on a solution card.
     *
     * strainCode is null rather than invented. The other thirteen codes are
     * real identifiers printed on the sachet — they are literally the live
     * site's own pack-image filenames — so one cannot be minted here.
     * applications and selectorProfile are empty for the same reason: an
     * application tag is a technical recommendation and the selector would
     * otherwise offer a product nobody can specify.
     *
     * See CONTENT-TODO.md for the full list of what the client needs to
     * confirm before this page can say anything more.
     */
    slug: "abfermenta",
    name: "ABFERMENTA",
    strainCode: null,
    category: "cultures",
    cultureType: null,
    applications: [],
    summary: "Specification available on request",
    description:
      "ABFERMENTA is part of the ABsource range. We confirm its specification against your product and your process, so it goes out with the sample rather than being published here.",
    image: "",
    specs: UNSPECIFIED_COMMON_SPECS,
    // NOT VERSUS_IMPORTED_DEFAULT. That asserts manufacture in Pune, rupee
    // invoicing and that the strain blend can be adjusted — three claims about
    // a product whose category is still being confirmed. These two say only
    // what is true of ABsource as a supplier.
    versusImported: [
      "Supplied and supported from Pune, by the team you would be dealing with directly.",
      "We confirm the specification against your product before we send a sample.",
      "If the specification does not fit, our R&D develops to your requirement.",
    ],
    selectorProfile: null,
  },

  /* ======================= DAIRY INGREDIENTS (7) ======================= */
  {
    slug: "abbind",
    name: "ABBIND",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["curd-dahi", "yoghurt"],
    summary: "Stabiliser system for fermented dairy",
    description:
      "A stabiliser system for fermented dairy products. Full composition and dosage are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abbind.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: null,
  },
  {
    slug: "abbindmax",
    name: "ABBINDMAX",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["curd-dahi", "yoghurt"],
    summary: "Higher-strength stabiliser system",
    description:
      "A higher-strength stabiliser system for fermented dairy where additional body is required. Full composition and dosage are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abbindmax.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: null,
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
    selectorProfile: null,
  },
  {
    slug: "abhipro",
    name: "ABHIPRO",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["yoghurt", "probiotics-functional"],
    summary: "High-protein dairy ingredient",
    description:
      "A high-protein dairy ingredient for high-protein yoghurt and functional formats. Full composition and dosage are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abhipro.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: null,
  },
  {
    slug: "abrenno",
    name: "ABRENNO",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["cheese-paneer"],
    summary: "Microbial rennet for cheese and paneer",
    description:
      "A microbial rennet coagulant for cheese and paneer manufacture. Strength and dosage are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abrenno.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: null,
  },
  {
    slug: "abmerge",
    name: "ABMERGE",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["cheese-paneer", "curd-dahi"],
    summary: "Functional blend for dairy processing",
    description:
      "A functional ingredient blend for dairy processing. Full composition and dosage are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abmerge.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: null,
  },
  {
    slug: "abblend",
    name: "ABBLEND",
    strainCode: null,
    category: "ingredients",
    cultureType: null,
    applications: ["curd-dahi", "yoghurt", "buttermilk-lassi"],
    summary: "Compound blend for fermented dairy",
    description:
      "A compound ingredient blend for fermented dairy products. Full composition and dosage are supplied on the technical data sheet.",
    image: "/assets/products/ingredients/abblend.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: null,
  },

  /* ========================= TASTE MAKERS (1) ========================= */
  {
    slug: "abspice",
    name: "ABSPICE",
    strainCode: null,
    category: "taste-makers",
    cultureType: null,
    applications: ["buttermilk-lassi", "fermented-foods-beverages"],
    summary: "Savoury seasoning system for dairy",
    description:
      "A savoury seasoning system for dairy applications such as spiced chach and savoury fermented drinks. Full composition is supplied on the technical data sheet.",
    image: "/assets/products/taste-makers/abspice.webp",
    specs: INGREDIENT_COMMON_SPECS,
    versusImported: VERSUS_IMPORTED_DEFAULT,
    selectorProfile: null,
  },
];

/* --- Derived lookups ----------------------------------------------------- */

export const cultures = products.filter((p) => p.category === "cultures");
export const ingredients = products.filter((p) => p.category === "ingredients");
export const tasteMakers = products.filter((p) => p.category === "taste-makers");

/**
 * The published strain codes, in catalogue order. Drives the StrainIndex rail.
 *
 * Derived rather than counted: not every culture line has a published code —
 * ABFERMENTA's has not reached us — so this is deliberately shorter than
 * `cultures`. Do not write copy that assumes the two are the same length.
 */
export const codedCultures = cultures.filter(
  (p): p is Product & { strainCode: string } => p.strainCode !== null
);

export const strainCodes: readonly string[] = codedCultures.map((p) => p.strainCode);

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

export const CATEGORY_LABELS: Record<string, string> = {
  cultures: "DVS starter cultures",
  ingredients: "Dairy ingredients",
  "taste-makers": "Taste makers",
};

export const CULTURE_TYPE_LABELS: Record<string, string> = {
  thermophilic: "Thermophilic",
  mesophilic: "Mesophilic",
  blended: "Blended",
  probiotic: "Probiotic",
};
