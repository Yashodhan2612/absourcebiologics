/**
 * Content types. Everything under src/content/ is typed against these, so a
 * malformed product or solution is a build error rather than a broken page.
 */

/**
 * "gir-cow-ghee" holds a single product (AB704) at the client's request. It is
 * a category in its own right on /products, not a sub-division of cultures.
 */
export type Category = "cultures" | "gir-cow-ghee" | "ingredients" | "taste-makers";

export type CultureType = "thermophilic" | "mesophilic" | "blended" | "probiotic";

/** The eight application families. These drive the nav, the mega menu and the
 *  solution pages, so the union is the single source of truth for all three. */
export type SolutionTag =
  | "curd-dahi"
  | "yoghurt"
  | "cheese-paneer"
  | "buttermilk-lassi"
  | "shrikhand-mishti-doi"
  | "cultured-ghee-butter"
  | "probiotics-functional"
  | "fermented-foods-beverages";

/**
 * What a product can be tagged with.
 *
 * The eight solution families, plus tags that exist ONLY as a catalogue filter
 * on /products. "vegan" is one of those: the client asked for a Vegan
 * application filter, but there is no vegan solution page, no nav entry and no
 * published process guidance to put on one. Keeping the two unions apart is
 * what stops a filter-only tag from needing a Solution, an icon and a route.
 */
export type FilterOnlyTag = "vegan";
export type ApplicationTag = SolutionTag | FilterOnlyTag;

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
  /**
   * A single code for the whole line, if the client ever publishes one.
   * A code for the whole product, where its pack prints one (the ingredients
   * and the taste maker). Null on every culture line: their codes identify a
   * variant within the line and live in src/content/variants.ts.
   */
  readonly strainCode: string | null;
  readonly category: Category;
  readonly cultureType: CultureType | null;
  readonly applications: readonly ApplicationTag[];
  /** One line. Used in the ProductCodeIndex hover panel and catalogue cards. */
  readonly summary: string;
  /** Two sentences, "what it is". */
  readonly description: string;
  /**
   * Path under /public, or "" when there is no photograph to show yet. Every
   * consumer treats "" as "no image" and renders its placeholder — never a
   * broken <img>, and never a photograph of something else.
   */
  readonly image: string;
  /**
   * What `image` is. Defaults to "pack" — the colour-coded catalogue artwork,
   * which is illustrative of the range rather than of what is delivered.
   *
   * "photo" is a photograph of the product's OWN printed pack (FERMENTA's
   * sachet). It must NOT be mapped onto the 3D sachet model, which expects the
   * flat catalogue artwork, and it must NOT carry the "colour-coded, delivered
   * in the standard blue and white sachet" note: that caption is about
   * illustrative artwork, and this is the thing itself.
   */
  readonly imageKind?: "pack" | "photo";
  /** The printed reverse of the pack, where it carries storage and marks. */
  readonly imageBack?: string;
  /**
   * The slug of the product whose pack artwork `image` borrows.
   *
   * Three products are shown in another line's pack at the client's
   * instruction: ABDAHI (Probiotic) in ABDAHI's, ABSHRI (with ABBIO-Shield) in
   * ABSHRI's, and AB704 in ABCREAM's. Declaring it makes the sharing explicit,
   * so catalogue.test.ts can assert that no two products share a photograph by
   * accident.
   */
  readonly packOf?: string;
  /**
   * What the culture is added to. Defaults to "milk". Only wording keys off
   * it — "trial it on your own milk" is wrong for a batter culture.
   */
  readonly substrate?: "milk" | "batter";
  /**
   * "available" is the default. "pilot" marks a product that exists but is not
   * yet orderable — currently in testing with select customers. Every page
   * that would otherwise offer a sample, a data sheet or a spec table keys off
   * this one field rather than special-casing a slug, so the next product to
   * go through a pilot needs no code.
   */
  readonly availability?: "available" | "pilot";
  readonly specs: readonly SpecRow[];
  /** Why this over an imported equivalent. Three for a supplied product, no
   *  national-pride language (Section 13 bans it on product pages). Empty for
   *  a pilot product that is not yet supplied — the section then does not
   *  render, rather than making comparative claims about a product nobody can
   *  order. */
  readonly versusImported: readonly string[];
};

/* --- Solutions ----------------------------------------------------------- */

export type Solution = {
  readonly slug: SolutionTag;
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
