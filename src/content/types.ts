/**
 * Content types. Everything under src/content/ is typed against these, so a
 * malformed product or solution is a build error rather than a broken page.
 */

export type Category = "cultures" | "ingredients" | "taste-makers";

export type CultureType = "thermophilic" | "mesophilic" | "blended" | "probiotic";

/** The eight application families. These drive the nav, the mega menu and the
 *  solution pages, so the union is the single source of truth for all three. */
export type ApplicationTag =
  | "curd-dahi"
  | "yoghurt"
  | "cheese-paneer"
  | "buttermilk-lassi"
  | "shrikhand-mishti-doi"
  | "cultured-ghee-butter"
  | "probiotics-functional"
  | "fermented-foods-beverages";

/* --- Culture Selector vocabulary ---------------------------------------- */

export type MakingAnswer =
  | "curd-dahi"
  | "yoghurt"
  | "cheese"
  | "paneer"
  | "buttermilk-chach"
  | "lassi"
  | "shrikhand"
  | "mishti-doi"
  | "cultured-ghee"
  | "kefir"
  | "probiotic-functional"
  | "other-fermented";

export type PackFormat = "cup" | "pouch" | "bucket" | "bulk";
export type MilkFat = "full-fat" | "toned" | "double-toned" | "low-fat";
export type Acidity = "mild" | "medium" | "sharp" | "unsure";
export type Texture = "firm-set" | "creamy" | "stirred" | "thick";
export type Flavour = "clean" | "buttery" | "sweet-mild" | "sharp-tangy";
export type ProbioticNeed = "yes" | "no" | "maybe";
export type BatchSize = "under-500" | "500-5000" | "5000-50000" | "over-50000";

/**
 * Weighted attributes the selector engine scores against. A product only
 * matches on axes it actually declares — an empty array means "not applicable",
 * never "matches everything", so the engine cannot manufacture a false match.
 */
export type SelectorProfile = {
  readonly making: readonly MakingAnswer[];
  readonly packFormats: readonly PackFormat[];
  readonly milkFat: readonly MilkFat[];
  readonly acidity: readonly Acidity[];
  readonly texture: readonly Texture[];
  readonly flavour: readonly Flavour[];
  readonly probiotic: boolean;
  readonly batchSizes: readonly BatchSize[];
  /** Shown to the buyer verbatim when this product is recommended. */
  readonly rationale: string;
  /** Honest caveats surfaced with the match, e.g. incubation capacity. */
  readonly caveats: readonly string[];
};

/* --- Specifications ------------------------------------------------------ */

/**
 * A spec row is either known or explicitly outstanding. There is no third
 * state and no default, which is what stops a guess reaching a QA manager's
 * screen (Section 8, product detail page).
 *
 * `todo` rows do not render as data. The spec table shows them as available on
 * the data sheet, which is both truthful and the point at which the buyer
 * becomes a lead.
 */
export type SpecRow =
  | { readonly label: string; readonly value: string }
  | { readonly label: string; readonly todo: string };

export function isKnownSpec(
  row: SpecRow
): row is { label: string; value: string } {
  return "value" in row;
}

/* --- Products ------------------------------------------------------------ */

export type Product = {
  readonly slug: string;
  readonly name: string;
  /** Strain code — CU01, LF01, YC01 ... Cultures only; null for ingredients. */
  readonly strainCode: string | null;
  readonly category: Category;
  readonly cultureType: CultureType | null;
  readonly applications: readonly ApplicationTag[];
  /** One line. Used in the StrainIndex hover panel and catalogue cards. */
  readonly summary: string;
  /** Two sentences, "what it is". */
  readonly description: string;
  readonly image: string;
  readonly specs: readonly SpecRow[];
  /** Why this over an imported equivalent — exactly three, no national-pride
   *  language (Section 13 bans it on product pages). */
  readonly versusImported: readonly [string, string, string];
  readonly selectorProfile: SelectorProfile | null;
};

/* --- Solutions ----------------------------------------------------------- */

export type Solution = {
  readonly slug: ApplicationTag;
  readonly name: string;
  /** Headline framed as the buyer's problem, not as a category label. */
  readonly headline: string;
  readonly summary: string;
  readonly challenge: readonly [string, string];
  readonly image: string;
  readonly processParameters: readonly SpecRow[];
  readonly faqs: readonly { readonly q: string; readonly a: string }[];
};

/* --- Services ------------------------------------------------------------ */

export type Service = {
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly forWhom: string;
  readonly includes: readonly string[];
  /** Engagement genuinely is a sequence here, so numbered steps are correct. */
  readonly process: readonly { readonly step: string; readonly detail: string }[];
};
