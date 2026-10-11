import { products } from "./products";

/**
 * The culture catalogue — every coded variant ABsource offers.
 *
 * SOURCE: the client's "Master copy of all variants-updated.xlsx". This file is
 * a transcription of that sheet and supersedes the earlier taste-profile
 * grouping, which covered curd and yoghurt only. Nothing here is invented.
 *
 * THE MODEL.
 *
 *   A *product line* is what a buyer orders against: ABDAHI, ABCHEESE. Those
 *   live in products.ts and are what /products lists.
 *
 *   A *variant* is a coded culture within a line: AB436NX and AB201NX are both
 *   ways of buying ABDAHI. Variants are what the Culture Selector suggests,
 *   and they never get their own pages or catalogue cards.
 *
 * HOW THE ATTRIBUTES WERE READ.
 *
 * The sheet describes each variant in a free-text "Attributes" cell
 * ("Suitable for Toned Milk/cup curd/firm set/medium sour"). `descriptor`
 * carries that text, tidied for spelling only. The structured fields beside it
 * (`pack`, `milkFat`, `acidity`, `texture`, `flavour`) are that same text read
 * into the six selector axes the sheet itself lists beside the curd table.
 *
 * A field is filled ONLY where the cell says so. An absent field means the
 * sheet is silent, never "suits everything" — the selector gives a variant no
 * credit on an axis it does not declare. Where a phrase needed a judgement
 * call it is listed in CONTENT-TODO.md §0c so the client can overrule it:
 *   "sharp cut" / "clean cut"  -> texture: firm-set
 *   "highly viscous" / "thick" -> texture: thick
 *   "spoonable" / "creamy"     -> texture: creamy
 *   "diacetyl" / "buttery"     -> flavour: buttery
 *   "tangy"                    -> flavour: sharp-tangy
 *   "mild set" / "mild"        -> acidity: mild
 *   "medium sour"              -> acidity: medium
 *   "acidic" (buttermilk, lassi, shrikhand bases) -> acidity: sharp
 *
 * ABOUT THE CODES ON THE PACK ARTWORK. The sachet photographs carry legacy
 * line codes (CU01, YC01, SH01 …) printed on the pack. The client asked for the
 * site to use the catalogue's variant codes instead, so those legacy codes are
 * not used as text anywhere; they remain visible only inside the photographs.
 */

/* ------------------------------------------------------------ vocabulary */

export type PackFormat = "cup" | "pouch" | "bucket" | "bulk";
export type MilkFat = "full-fat" | "toned" | "double-toned" | "low-fat";
export type Acidity = "mild" | "medium" | "sharp";
export type Texture = "firm-set" | "creamy" | "stirred" | "thick";
export type Flavour = "clean" | "buttery" | "sweet-mild" | "sharp-tangy";

/** The sheet's fifteen sections. */
export type FamilyKey =
  | "curd"
  | "low-fat-curd"
  | "buttermilk"
  | "lassi"
  | "cheese"
  | "yoghurt"
  | "shrikhand"
  | "mishti-doi"
  | "probiotics"
  | "bioprotective"
  | "cream"
  | "kefir"
  | "laban"
  | "idli-dosa"
  | "vegan";

/** What a visitor can say they are making. The selector's first question. */
export type MakingKey =
  | "curd-dahi"
  | "yoghurt"
  | "buttermilk-chach"
  | "lassi"
  | "cheese"
  | "shrikhand"
  | "mishti-doi"
  | "cream-ghee"
  | "kefir"
  | "laban"
  | "idli-dosa"
  | "probiotic-cultures"
  | "bioprotective-cultures"
  | "other";

export type Variant = {
  readonly code: string;
  readonly family: FamilyKey;
  /** The client's own description, tidied for spelling only. */
  readonly descriptor: string;
  /** Sub-type within the family: the cheese variety, the yoghurt style. */
  readonly style?: readonly string[];
  readonly pack?: readonly PackFormat[];
  readonly milkFat?: readonly MilkFat[];
  readonly acidity?: readonly Acidity[];
  readonly texture?: readonly Texture[];
  readonly flavour?: readonly Flavour[];
  /** The sheet states a probiotic claim for this variant. */
  readonly probiotic?: true;
  /** The sheet states bioprotective strains for this variant. */
  readonly bioprotective?: true;
  /** Ordered against this line instead of the family's default one. */
  readonly orderAs?: string;
  /** Also suggested when the visitor is making something outside its family. */
  readonly alsoMaking?: readonly MakingKey[];
  /** The line it is ordered against in that other context. */
  readonly orderAsFor?: Partial<Record<MakingKey, string>>;
  /** Other product pages that list this variant. */
  readonly alsoListedOn?: readonly string[];
  /**
   * False keeps a variant out of everything public. Used where the client's own
   * sheet marks a strain's identity "Not confirmed" — see CONTENT-TODO.md §0c.
   */
  readonly published?: false;
};

/* --------------------------------------------------------------- families */

export const families: Record<
  FamilyKey,
  {
    readonly label: string;
    /** The product line this family is ordered against. */
    readonly productSlug: string;
    /** Sub-types, where the sheet splits the family. In sheet order. */
    readonly styles?: readonly { readonly value: string; readonly label: string }[];
  }
> = {
  curd: { label: "Curd / dahi", productSlug: "abdahi" },
  "low-fat-curd": { label: "Low-fat curd", productSlug: "abdahi-low-fat" },
  buttermilk: { label: "Buttermilk / chach", productSlug: "abchach" },
  lassi: { label: "Lassi", productSlug: "ablassi" },
  cheese: {
    label: "Cheese",
    productSlug: "abcheese",
    styles: [
      { value: "mozzarella", label: "Mozzarella" },
      { value: "cheddar", label: "Cheddar" },
      { value: "feta", label: "Feta" },
      { value: "gouda", label: "Gouda" },
      { value: "cream-cheese", label: "Cream cheese" },
      { value: "edam", label: "Edam" },
      { value: "white-brine", label: "White brine cheese" },
      { value: "camembert", label: "Camembert" },
      { value: "emmental", label: "Emmental" },
      { value: "parmesan", label: "Parmesan" },
      { value: "caciotta", label: "Caciotta" },
      { value: "provolone", label: "Provolone" },
    ],
  },
  yoghurt: {
    label: "Yoghurt",
    productSlug: "abyogurt",
    styles: [
      { value: "set", label: "Set yoghurt" },
      { value: "fruit", label: "Fruit yoghurt" },
      { value: "greek", label: "Greek-style" },
      { value: "stirred", label: "Stirred yoghurt" },
      { value: "drinking", label: "Drinking yoghurt" },
    ],
  },
  shrikhand: { label: "Shrikhand", productSlug: "abshri" },
  "mishti-doi": { label: "Mishti doi", productSlug: "abmishti" },
  // ABPROBIO and ABBIO-SHIELD were renamed by the client to ABDAHI (Probiotic)
  // and ABSHRI (with ABBIO-Shield). The strain-level cultures that used to sit
  // under the old names follow them to the new ones.
  probiotics: { label: "Probiotic cultures", productSlug: "abdahi-probiotic" },
  bioprotective: { label: "Bioprotective cultures", productSlug: "abshri-bio-shield" },
  cream: {
    label: "Cream & cultured ghee",
    productSlug: "abcream",
    styles: [
      { value: "sour-cream", label: "Sour cream" },
      { value: "ghee", label: "Cultured ghee" },
    ],
  },
  kefir: { label: "Kefir", productSlug: "abkefir" },
  laban: { label: "Laban", productSlug: "ablaban" },
  "idli-dosa": { label: "Idli / dosa batter", productSlug: "fermenta" },
  vegan: { label: "Vegan (soya)", productSlug: "abvegan" },
};

/* ---------------------------------------------------------------- variants */

const TONED = ["toned"] as const;
const TONED_FULL = ["toned", "full-fat"] as const;

export const variants: readonly Variant[] = [
  /* ============================== 1. CURD ============================== */
  { code: "AB201NX", family: "curd", descriptor: "Toned milk, cup curd. Firm set, medium sour.", milkFat: TONED, pack: ["cup"], texture: ["firm-set"], acidity: ["medium"] },
  { code: "AB202NX", family: "curd", descriptor: "Toned milk, cup curd. Firm set, medium sour; desi curd.", milkFat: TONED, pack: ["cup"], texture: ["firm-set"], acidity: ["medium"] },
  { code: "AB203NX", family: "curd", descriptor: "Toned milk, cup curd. Firm set with a creamy texture and diacetyl aroma.", milkFat: TONED, pack: ["cup"], texture: ["firm-set", "creamy"], flavour: ["buttery"] },
  { code: "AB204NX", family: "curd", descriptor: "Toned milk, cup curd. Firm set, smooth and creamy, with diacetyl aroma; desi curd.", milkFat: TONED, pack: ["cup"], texture: ["firm-set", "creamy"], flavour: ["buttery"] },
  { code: "AB207NX", family: "curd", descriptor: "High-fat or toned milk, cup curd. Firm set, medium sour.", milkFat: TONED_FULL, pack: ["cup"], texture: ["firm-set"], acidity: ["medium"] },
  { code: "AB208NX", family: "curd", descriptor: "Toned milk, cup or pouch. Creamy and spoonable, with a buttery taste.", milkFat: TONED, pack: ["cup", "pouch"], texture: ["creamy"], flavour: ["buttery"] },
  { code: "AB209NX", family: "curd", descriptor: "Toned milk, cup curd. Sharp cut, with a buttery taste.", milkFat: TONED, pack: ["cup"], texture: ["firm-set"], flavour: ["buttery"] },
  { code: "AB211NX", family: "curd", descriptor: "Toned or double-toned milk, cup or pouch. Sharp cut, with diacetyl flavour.", milkFat: ["toned", "double-toned"], pack: ["cup", "pouch"], texture: ["firm-set"], flavour: ["buttery"] },
  { code: "AB237NX", family: "curd", descriptor: "Toned or full-fat milk, cup curd. Mild set.", milkFat: TONED_FULL, pack: ["cup"], acidity: ["mild"] },
  { code: "AB298NX", family: "curd", descriptor: "Toned or full-fat milk, cup or pouch. Highly viscous curd.", milkFat: TONED_FULL, pack: ["cup", "pouch"], texture: ["thick"] },
  { code: "AB435NX", family: "curd", descriptor: "Toned or full-fat milk, cup or pouch. Highly viscous curd.", milkFat: TONED_FULL, pack: ["cup", "pouch"], texture: ["thick"] },
  { code: "AB436NX", family: "curd", descriptor: "Toned or full-fat milk, cup or pouch. Highly viscous curd with a clean cut.", milkFat: TONED_FULL, pack: ["cup", "pouch"], texture: ["thick", "firm-set"] },
  { code: "AB438NX", family: "curd", descriptor: "Toned or full-fat milk, cup or pouch. Highly viscous curd with a clean cut.", milkFat: TONED_FULL, pack: ["cup", "pouch"], texture: ["thick", "firm-set"] },
  { code: "AB439NX", family: "curd", descriptor: "Toned milk, cup curd. Mild set.", milkFat: TONED, pack: ["cup"], acidity: ["mild"] },
  { code: "AB442NX", family: "curd", descriptor: "Toned milk, cup or pouch. Mild set, with more diacetyl aroma.", milkFat: TONED, pack: ["cup", "pouch"], acidity: ["mild"], flavour: ["buttery"] },
  { code: "AB451NX", family: "curd", descriptor: "Cup curd. Mild in taste.", pack: ["cup"], acidity: ["mild"] },
  { code: "AB452NX", family: "curd", descriptor: "Cup or pouch curd. More diacetyl flavour, no post-acidification.", pack: ["cup", "pouch"], flavour: ["buttery"] },
  { code: "AB739NX", family: "curd", descriptor: "Toned milk, cup curd. Medium sour, with a smooth, firm texture.", milkFat: TONED, pack: ["cup"], acidity: ["medium"], texture: ["firm-set"] },
  { code: "AB741NX", family: "curd", descriptor: "Toned milk, cup curd. Creamy texture, smooth with a clean cut.", milkFat: TONED, pack: ["cup"], texture: ["creamy", "firm-set"] },
  { code: "AB779NX", family: "curd", descriptor: "Toned milk, cup or pouch. Creamy texture, smooth with a clean cut.", milkFat: TONED, pack: ["cup", "pouch"], texture: ["creamy", "firm-set"] },
  { code: "AB755NX", family: "curd", descriptor: "Toned milk, cup or bucket. Set curd with diacetyl aroma, mild in taste.", milkFat: TONED, pack: ["cup", "bucket"], acidity: ["mild"], flavour: ["buttery"] },
  { code: "AB759NX", family: "curd", descriptor: "Toned or full-fat milk. Medium sour, with a spoonable consistency.", milkFat: TONED_FULL, acidity: ["medium"], texture: ["creamy"] },
  { code: "AB767NX", family: "curd", descriptor: "Toned milk, cup curd. Tangy taste with diacetyl aroma.", milkFat: TONED, pack: ["cup"], flavour: ["sharp-tangy", "buttery"] },
  // The sheet reads "AB77NX". Every other curd code has three digits and the
  // earlier taste-profile sheet lists AB777NX, so it is published as that.
  { code: "AB777NX", family: "curd", descriptor: "Toned milk, cup curd. Medium sour, thick curd.", milkFat: TONED, pack: ["cup"], acidity: ["medium"], texture: ["thick"] },
  { code: "AB757NX", family: "curd", descriptor: "Toned milk, cup curd. Mild set, with a smooth texture.", milkFat: TONED, pack: ["cup"], acidity: ["mild"] },
  { code: "AB107NX", family: "curd", descriptor: "Toned milk, cup or pouch. Mild, firm set.", milkFat: TONED, pack: ["cup", "pouch"], acidity: ["mild"], texture: ["firm-set"] },

  /* ========================== 2. LOW-FAT CURD ========================== */
  { code: "AB402NX", family: "low-fat-curd", descriptor: "Low-fat curd, pouch or cup. Clean set with a sharp cut.", milkFat: ["low-fat"], pack: ["pouch", "cup"], texture: ["firm-set"] },
  { code: "AB404NX", family: "low-fat-curd", descriptor: "Low-fat curd, pouch. Mild, with diacetyl aroma and a firm texture.", milkFat: ["low-fat"], pack: ["pouch"], acidity: ["mild"], flavour: ["buttery"], texture: ["firm-set"] },
  { code: "AB407NX", family: "low-fat-curd", descriptor: "Low-fat curd, cup or pouch. Medium sour, with diacetyl aroma.", milkFat: ["low-fat"], pack: ["cup", "pouch"], acidity: ["medium"], flavour: ["buttery"] },
  { code: "AB805NX", family: "low-fat-curd", descriptor: "Low-fat curd, pouch or cup. Medium sour, with a firm texture.", milkFat: ["low-fat"], pack: ["pouch", "cup"], acidity: ["medium"], texture: ["firm-set"] },

  /* =========================== 3. BUTTERMILK =========================== */
  { code: "AB300NX", family: "buttermilk", descriptor: "Toned milk. Acidic curd with a creamy texture and buttery taste.", milkFat: TONED, acidity: ["sharp"], flavour: ["buttery"] },
  { code: "AB302NX", family: "buttermilk", descriptor: "Toned or double-toned milk. Mild acidity, rich diacetyl aroma.", milkFat: ["toned", "double-toned"], acidity: ["mild"], flavour: ["buttery"] },
  { code: "AB304NX", family: "buttermilk", descriptor: "Low-fat or toned milk. Mild to medium acidity.", milkFat: ["low-fat", "toned"], acidity: ["mild", "medium"] },
  { code: "AB306NX", family: "buttermilk", descriptor: "Acidic curd for buttermilk, used for a high diacetyl flavour.", acidity: ["sharp"], flavour: ["buttery"] },
  { code: "AB307NX", family: "buttermilk", descriptor: "Acidic curd for buttermilk, used for a high diacetyl flavour and aroma.", acidity: ["sharp"], flavour: ["buttery"] },
  { code: "AB319NX", family: "buttermilk", descriptor: "Thick, creamy curd for mild or sour buttermilk.", acidity: ["mild", "sharp"] },
  { code: "AB329NX", family: "buttermilk", descriptor: "Acidic curd with a thick consistency, rich in diacetyl aroma.", acidity: ["sharp"], flavour: ["buttery"] },
  { code: "AB330NX", family: "buttermilk", descriptor: "Acidic curd for buttermilk.", acidity: ["sharp"] },
  { code: "AB331NX", family: "buttermilk", descriptor: "Mildly acidic and creamy, thick in texture, rich in diacetyl.", acidity: ["mild"], flavour: ["buttery"] },
  { code: "AB335NX", family: "buttermilk", descriptor: "Mildly acidic, creamy curd for buttermilk.", acidity: ["mild"] },
  { code: "AB946NX", family: "buttermilk", descriptor: "Tangy, thick curd with diacetyl flavour, for probiotic buttermilk.", flavour: ["sharp-tangy", "buttery"], probiotic: true, alsoListedOn: ["abdahi-probiotic"] },

  /* ============================== 4. LASSI ============================== */
  { code: "AB621NX", family: "lassi", descriptor: "Mildly acidic curd for a thick, slightly sour and sweet lassi.", acidity: ["mild"] },
  { code: "AB624NX", family: "lassi", descriptor: "Mildly acidic, thick curd for sour and sweet lassi, with rich diacetyl aroma.", acidity: ["mild"], flavour: ["buttery"] },
  { code: "AB626NX", family: "lassi", descriptor: "Acidic curd with a thick texture, for sour and sweet lassi.", acidity: ["sharp"] },
  { code: "AB975NX", family: "lassi", descriptor: "Smooth, creamy curd with mild sourness and high viscosity, for thick lassi with a probiotic claim.", acidity: ["mild"], probiotic: true, alsoListedOn: ["abdahi-probiotic"] },

  /* ============================== 5. CHEESE ============================== */
  { code: "AB516", family: "cheese", style: ["mozzarella"], descriptor: "Thermophilic culture for mozzarella." },
  { code: "AB512", family: "cheese", style: ["mozzarella"], descriptor: "Blend of thermophilic strains for mozzarella." },
  { code: "AB519", family: "cheese", style: ["cheddar"], descriptor: "Blend of mesophilic strains for cheddar." },
  { code: "AB520", family: "cheese", style: ["cheddar"], descriptor: "Blend of mesophilic strains for cheddar." },
  { code: "AB529", family: "cheese", style: ["feta"], descriptor: "Blend of thermophilic and mesophilic bacteria for feta." },
  { code: "AB503", family: "cheese", style: ["gouda"], descriptor: "Blend of thermophilic and mesophilic bacteria for gouda." },
  { code: "AB504", family: "cheese", style: ["gouda"], descriptor: "Blend of thermophilic and mesophilic bacteria for gouda." },
  { code: "AB505", family: "cheese", style: ["cream-cheese"], descriptor: "Mesophilic strains for cream cheese." },
  { code: "AB507", family: "cheese", style: ["edam"], descriptor: "Blend of thermophilic and mesophilic strains for edam." },
  // The sheet gives AB509 for BOTH white brine cheese and Camembert. Published
  // as written; see CONTENT-TODO.md §0c — one of the two is probably a typo.
  { code: "AB509", family: "cheese", style: ["white-brine", "camembert"], descriptor: "Blend of thermophilic and mesophilic bacteria, listed for white brine cheese and for Camembert." },
  { code: "AB523", family: "cheese", style: ["emmental"], descriptor: "Blend of thermophilic and mesophilic bacteria for emmental." },
  { code: "AB525", family: "cheese", style: ["parmesan"], descriptor: "Blend of thermophilic and mesophilic bacteria for parmesan." },
  { code: "AB513", family: "cheese", style: ["caciotta"], descriptor: "Thermophilic bacteria for caciotta." },
  { code: "AB527", family: "cheese", style: ["provolone"], descriptor: "Blend of thermophilic and mesophilic bacteria for provolone." },

  /* ============================= 6. YOGHURT ============================= */
  { code: "AB151NX", family: "yoghurt", style: ["set", "fruit"], descriptor: "Set or fruit yoghurt. Mild acidity, creamy taste, no post-acidification.", acidity: ["mild"] },
  { code: "AB152NX", family: "yoghurt", style: ["set", "fruit"], descriptor: "Set or fruit yoghurt. Mild acidity, diacetyl flavour, no post-acidification.", acidity: ["mild"], flavour: ["buttery"] },
  { code: "AB153NX", family: "yoghurt", style: ["set"], descriptor: "Set yoghurt with sugar. Medium sourness, creamy taste, no post-acidification.", acidity: ["medium"] },
  { code: "AB154NX", family: "yoghurt", style: ["greek"], descriptor: "Greek-style yoghurt. Diacetyl aroma, smooth and set texture.", flavour: ["buttery"] },
  { code: "AB155NX", family: "yoghurt", style: ["greek"], descriptor: "Greek-style yoghurt. Rich diacetyl flavour.", flavour: ["buttery"] },
  { code: "AB164NX", family: "yoghurt", style: ["drinking"], descriptor: "Drinking yoghurt. Sweet and sour taste, creamy texture." },
  { code: "AB165NX", family: "yoghurt", style: ["stirred"], descriptor: "Stirred yoghurt. Sweet and sour taste, creamy texture." },
  { code: "AB175NX", family: "yoghurt", style: ["set"], descriptor: "Set yoghurt. Firm texture, mild taste.", acidity: ["mild"] },
  {
    code: "AB921NX",
    family: "yoghurt",
    descriptor: "Thick, clean-textured curd or yoghurt with a probiotic claim.",
    probiotic: true,
    // The sheet describes it as "curd / yoghurt", so it is the probiotic answer
    // for a curd maker as well, ordered there as ABDAHI (Probiotic).
    alsoMaking: ["curd-dahi"],
    orderAsFor: { "curd-dahi": "abdahi-probiotic" },
    alsoListedOn: ["abdahi-probiotic"],
  },

  /* ============================ 7. SHRIKHAND ============================ */
  { code: "SH0102", family: "shrikhand", descriptor: "Smooth, creamy chakka with medium acidity.", acidity: ["medium"] },
  { code: "SH0104", family: "shrikhand", descriptor: "Sour chakka with a tangy taste, for sweet-and-sour shrikhand.", acidity: ["sharp"] },
  { code: "SH0109", family: "shrikhand", descriptor: "Highly acidic chakka giving a smooth, creamy, sweet-and-sour shrikhand.", acidity: ["sharp"] },
  { code: "SH0111", family: "shrikhand", descriptor: "Acidic chakka with diacetyl flavour.", acidity: ["sharp"] },
  { code: "AB1001", family: "shrikhand", descriptor: "Blend for sweet-and-sour shrikhand, with bioprotective strains.", bioprotective: true, orderAs: "abshri-bio-shield" },
  { code: "AB1002", family: "shrikhand", descriptor: "Blend for sweet-and-sour shrikhand, with bioprotective strains.", bioprotective: true, orderAs: "abshri-bio-shield" },

  /* ============================ 8. MISHTI DOI ============================ */
  { code: "MD0102", family: "mishti-doi", descriptor: "Sugar-tolerant strains giving a sweet-and-sour mishti doi with the typical fermented taste." },
  { code: "MD0108", family: "mishti-doi", descriptor: "Sugar-tolerant strains giving a sweet-and-sour mishti doi with the typical fermented taste." },
  { code: "MD0109", family: "mishti-doi", descriptor: "Sugar-tolerant strains giving a sweet-and-sour mishti doi with the typical fermented taste." },

  /* ============================ 9. PROBIOTICS ============================ */
  // Species names are spelled to current nomenclature; the sheet's own strain
  // designations (ABS01 …) are kept. Three rows are marked "Not confirmed" in
  // the client's sheet and are held back — a species name on a probiotic is a
  // regulatory statement, and theirs is the sheet that says it is unconfirmed.
  { code: "AB1401", family: "probiotics", descriptor: "Streptococcus thermophilus (ABS01)." },
  { code: "AB1402", family: "probiotics", descriptor: "Lactobacillus casei (ABS05)." },
  { code: "AB1403", family: "probiotics", descriptor: "Lactobacillus plantarum." },
  { code: "AB1404", family: "probiotics", descriptor: "Lactobacillus acidophilus (ABS43)." },
  { code: "AB1405", family: "probiotics", descriptor: "Lacticaseibacillus rhamnosus (ABS42).", published: false },
  { code: "AB1406", family: "probiotics", descriptor: "Lactobacillus reuteri.", published: false },
  { code: "AB1407", family: "probiotics", descriptor: "Bifidobacterium bifidum (ABS10).", published: false },
  { code: "AB1408", family: "probiotics", descriptor: "Blend of Lactobacillus acidophilus and Bifidobacterium lactis." },
  { code: "AB1409", family: "probiotics", descriptor: "Lactobacillus delbrueckii subsp. bulgaricus." },

  /* ========================== 10. BIOPROTECTIVE ========================== */
  { code: "AB1501", family: "bioprotective", descriptor: "Lactobacillus paracasei (ABS47).", bioprotective: true },
  { code: "AB1502", family: "bioprotective", descriptor: "Lactobacillus rhamnosus (ABS51).", bioprotective: true },
  { code: "AB1503", family: "bioprotective", descriptor: "Lactobacillus plantarum (ABS53).", bioprotective: true },
  { code: "AB1504", family: "bioprotective", descriptor: "Blend of ABS47 and ABS51.", bioprotective: true },

  /* ============================== 11. CREAM ============================== */
  { code: "AB703", family: "cream", style: ["sour-cream"], descriptor: "Blend of mesophilic bacteria for sour cream, with a mildly acidic diacetyl aroma." },
  // Also sold in its own right under the Gir Cow Ghee category (products.ts).
  { code: "AB704", family: "cream", style: ["ghee"], descriptor: "Cream culture for a well-flavoured, granular ghee. Patent applied for.", alsoListedOn: ["ab704"] },
  { code: "AB711", family: "cream", style: ["ghee"], descriptor: "Cream culture for an aromatic, granular ghee made from cream." },

  /* ============================== 12. KEFIR ============================== */
  { code: "AB351", family: "kefir", descriptor: "Blend of almost twenty strains of bacteria and yeast, giving a smooth, creamy kefir." },
  { code: "AB352", family: "kefir", descriptor: "Blend of twelve bacterial and yeast strains, giving a smooth, tangy, creamy kefir." },
  { code: "AB353", family: "kefir", descriptor: "Blend of sixteen bacterial strains, giving a smooth, tangy, creamy kefir." },

  /* ============================== 13. LABAN ============================== */
  { code: "AB602", family: "laban", descriptor: "Produces a tangy laban with a pleasant aroma." },

  /* ============================ 14. IDLI DOSA ============================ */
  { code: "AB1301", family: "idli-dosa", descriptor: "Single strain capable of fermenting idli and dosa batter." },
  { code: "AB1302", family: "idli-dosa", descriptor: "Blend of two bacterial strains for fermentation in batter." },

  /* ============================== 15. VEGAN ============================== */
  { code: "AB1201", family: "vegan", descriptor: "Single strain capable of fermenting soya milk into curd." },
  { code: "AB1202", family: "vegan", descriptor: "Single strain capable of fermenting soya milk into curd." },
  { code: "AB1211", family: "vegan", descriptor: "Blend of lactobacilli fermenting soya milk while masking the soya smell." },
  { code: "AB1212", family: "vegan", descriptor: "Blend of lactobacilli fermenting soya milk into curd with a pleasant aroma." },
];

/* ----------------------------------------------------------------- lookups */

const pilotProducts = new Set(
  products.filter((p) => p.availability === "pilot").map((p) => p.slug)
);

/**
 * Variants the public site may show.
 *
 * Two things are held back: rows the client's own sheet marks unconfirmed, and
 * the variants of a product that is still in pilot. ABVEGAN's page says its
 * specification is published at launch; listing its four codes and what each
 * does would publish it early.
 */
export const publicVariants: readonly Variant[] = variants.filter(
  (v) => v.published !== false && !pilotProducts.has(families[v.family].productSlug)
);

/** The line a variant is ordered against, optionally for a given context. */
export function productSlugFor(variant: Variant, making?: MakingKey): string {
  return (
    (making ? variant.orderAsFor?.[making] : undefined) ??
    variant.orderAs ??
    families[variant.family].productSlug
  );
}

/** Variants to list on a product page: its own family's, and any cross-listed. */
export function variantsForProduct(productSlug: string): readonly Variant[] {
  return publicVariants.filter(
    (v) =>
      families[v.family].productSlug === productSlug ||
      v.orderAs === productSlug ||
      (v.alsoListedOn?.includes(productSlug) ?? false)
  );
}

/** Families that have at least one public variant, in sheet order. */
export const publicFamilies: readonly FamilyKey[] = (
  Object.keys(families) as FamilyKey[]
).filter((key) => publicVariants.some((v) => v.family === key));

/** Every public code, once, in catalogue order. Drives the product-code rail. */
export const codeIndex: readonly Variant[] = publicVariants;

export function styleLabel(family: FamilyKey, value: string): string {
  return families[family].styles?.find((s) => s.value === value)?.label ?? value;
}

/**
 * How milk decides the variant. The client's own selection rule, from their
 * taste-profile sheet: it is the first thing a technologist is asked and the
 * thing buyers most often get wrong.
 *
 * It used to end with a table mapping milk types to specific codes. The master
 * sheet now states the milk for each variant individually, and that table
 * disagreed with it in places, so the per-variant descriptions are the single
 * statement of which milk a code suits.
 */
export const milkGuidance = {
  intro:
    "Which culture fits is decided by the milk before it is decided by taste. Four things set it:",
  factors: [
    "The fat content of the milk.",
    "The final SNF achieved.",
    "Whether the curd is packed in a pouch or a cup.",
    "Any specific attribute the product has to hit.",
  ],
} as const;
