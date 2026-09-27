import type { MakingAnswer, MilkFat, Acidity, Texture, Flavour } from "./types";

/**
 * The culture catalogue — the official ABsource product codes.
 *
 * THE MODEL, and why this file is separate from products.ts:
 *
 *   A *product* is a line a buyer orders against: ABDAHI, ABYOGURT, ABCHEESE.
 *   Those live in products.ts and are what /products lists.
 *
 *   A *culture* is a sub-category of a product — a specific coded blend tuned
 *   to one taste profile. AB436NX and AB759NX are both dahi cultures; one sets
 *   sweet, the other sets sour. Those live here.
 *
 * Cultures deliberately do NOT appear on /products. They are the level a
 * technologist selects at, so they surface in the Culture Selector and on the
 * parent product's page, not in the catalogue grid.
 *
 * EVERY CODE IN THIS FILE IS THE CLIENT'S OWN, transcribed from "Curd variants
 * as per the Taste profile.xlsx". Nothing here is invented. The site used to
 * carry codes of the form CU01 / YC01 / LF01, which were placeholders written
 * during the build; they have been removed rather than shown alongside real
 * ones, because a buyer cannot tell the two apart.
 *
 * Two transcription decisions are recorded in CONTENT-TODO.md §0c:
 *   - "AB452Nx" is normalised to AB452NX (casing only).
 *   - "AB755" is normalised to AB755NX, because AB755NX appears in two other
 *     cells and a bare AB755 appears in one. If they are genuinely different
 *     codes, say so and this splits back into two.
 */

export type CultureFamily = "curd-dahi" | "yoghurt";

/**
 * One coded blend. `note` is the client's own descriptor where they gave one
 * per code — the yoghurt range has them, the curd range is grouped by profile
 * instead and carries its description at the profile level.
 */
export type CultureCode = {
  readonly code: string;
  readonly note?: string;
};

/**
 * A taste profile: the unit a dairy technologist actually chooses at.
 *
 * `selector` is what the Culture Selector scores against. It is intentionally
 * narrow — a profile only declares the axes it genuinely differs on, so the
 * engine can never manufacture a match on an axis this profile is silent about.
 */
export type CultureProfile = {
  readonly slug: string;
  readonly family: CultureFamily;
  readonly name: string;
  readonly summary: string;
  /** The product line this profile is ordered against. */
  readonly productSlug: string;
  readonly codes: readonly CultureCode[];
  readonly selector: {
    readonly making: readonly MakingAnswer[];
    readonly milkFat: readonly MilkFat[];
    readonly acidity: readonly Acidity[];
    readonly texture: readonly Texture[];
    readonly flavour: readonly Flavour[];
    readonly probiotic: boolean;
  };
};

/* ===================== CURD / DAHI — 12 taste profiles ===================== */

const curdProfiles: readonly CultureProfile[] = [
  {
    slug: "sour-thick",
    family: "curd-dahi",
    name: "Sour and thick",
    summary:
      "A pronounced sour finish carried on a thick body. The profile for markets where curd is expected to bite.",
    productSlug: "abdahi",
    codes: [
      { code: "AB759NX" },
      { code: "AB767NX" },
      { code: "AB777NX" },
      { code: "AB739NX" },
    ],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["full-fat", "toned"],
      acidity: ["sharp"],
      texture: ["thick", "firm-set"],
      flavour: ["sharp-tangy"],
      probiotic: false,
    },
  },
  {
    slug: "mild-thick-set",
    family: "curd-dahi",
    name: "Mild and thick set",
    summary:
      "Thick set body with the acidity held back. The standard tonned-milk profile for pouch and cup curd.",
    productSlug: "abdahi",
    codes: [
      { code: "AB439NX" },
      { code: "AB451NX" },
      { code: "AB755NX" },
      { code: "AB442NX" },
      { code: "AB298NX" },
    ],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["toned", "double-toned"],
      acidity: ["mild"],
      texture: ["firm-set", "thick"],
      flavour: ["clean", "sweet-mild"],
      probiotic: false,
    },
  },
  {
    slug: "mildly-set",
    family: "curd-dahi",
    name: "Mildly set",
    summary:
      "A softer set that spoons easily rather than breaking clean. For curd eaten straight from the cup.",
    productSlug: "abdahi",
    codes: [
      { code: "AB207NX" },
      { code: "AB208NX" },
      { code: "AB209NX" },
      { code: "AB211NX" },
    ],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["toned", "double-toned"],
      acidity: ["mild"],
      texture: ["creamy", "stirred"],
      flavour: ["clean", "sweet-mild"],
      probiotic: false,
    },
  },
  {
    slug: "sweet-set-dahi",
    family: "curd-dahi",
    name: "Sweet set dahi",
    summary:
      "Minimal post-acidification, so the curd stays sweet through its shelf life rather than souring in the chain.",
    productSlug: "abdahi",
    codes: [
      { code: "AB436NX" },
      { code: "AB435NX" },
      { code: "AB298NX" },
      { code: "AB975NX" },
    ],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["full-fat", "toned"],
      acidity: ["mild"],
      texture: ["firm-set"],
      flavour: ["sweet-mild"],
      probiotic: false,
    },
  },
  {
    slug: "tangy-cooking",
    family: "curd-dahi",
    name: "Tangy / cooking",
    summary:
      "Built for curd that goes into a pan — kadhi, marinades, gravies — where the acidity has to survive heat.",
    productSlug: "abdahi",
    codes: [{ code: "AB757SQII" }, { code: "AB767NX" }],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["full-fat", "toned"],
      acidity: ["sharp", "medium"],
      texture: ["stirred", "thick"],
      flavour: ["sharp-tangy"],
      probiotic: false,
    },
  },
  {
    slug: "strong-sour",
    family: "curd-dahi",
    name: "Strong sour",
    summary:
      "The sharpest profile in the range, for regional markets where a mild curd reads as underset.",
    productSlug: "abdahi",
    codes: [
      { code: "AB756NX" },
      { code: "AB779SQII" },
      { code: "AB741SQII" },
      { code: "AB767NX" },
    ],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["full-fat", "toned"],
      acidity: ["sharp"],
      texture: ["thick", "firm-set"],
      flavour: ["sharp-tangy"],
      probiotic: false,
    },
  },
  {
    slug: "very-mild",
    family: "curd-dahi",
    name: "Very mild",
    summary:
      "The least acidic profile offered. For sweet curd, and for buyers whose complaint is that curd turns in transit.",
    productSlug: "abdahi",
    codes: [{ code: "AB438NX" }, { code: "AB442NX" }],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["toned", "double-toned"],
      acidity: ["mild"],
      texture: ["firm-set", "creamy"],
      flavour: ["sweet-mild"],
      probiotic: false,
    },
  },
  {
    slug: "creamy-rich",
    family: "curd-dahi",
    name: "Creamy and rich",
    summary:
      "Full mouthfeel on full-fat milk, with the fat carried rather than separated.",
    productSlug: "abdahi",
    codes: [
      { code: "AB201NX" },
      { code: "AB202NX" },
      { code: "AB203NX" },
      { code: "AB401NX" },
      { code: "AB402NX" },
      { code: "AB237NX" },
    ],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["full-fat"],
      acidity: ["mild", "medium"],
      texture: ["creamy", "thick"],
      flavour: ["clean", "buttery"],
      probiotic: false,
    },
  },
  {
    slug: "light-low-fat",
    family: "curd-dahi",
    name: "Light and low fat",
    summary:
      "Body held on reduced-fat milk, where there is no fat to carry it. The EPS-producing end of the range.",
    productSlug: "abdahi-low-fat",
    codes: [
      { code: "AB805NX" },
      { code: "AB401NX" },
      { code: "AB402NX" },
      { code: "AB404NX" },
      { code: "AB407NX" },
      { code: "AB452NX" },
    ],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["low-fat", "double-toned"],
      acidity: ["mild", "medium"],
      texture: ["firm-set", "thick"],
      flavour: ["clean"],
      probiotic: false,
    },
  },
  {
    slug: "probiotic-curd",
    family: "curd-dahi",
    name: "Probiotic",
    summary:
      "Curd cultures carrying a probiotic organism, for a product making a functional claim.",
    productSlug: "abprobio",
    codes: [{ code: "AB975NX" }, { code: "AB946NX" }, { code: "AB921NX" }],
    selector: {
      making: ["curd-dahi", "probiotic-functional"],
      milkFat: ["full-fat", "toned", "double-toned"],
      acidity: ["mild", "medium"],
      texture: ["firm-set", "creamy"],
      flavour: ["clean", "sweet-mild"],
      probiotic: true,
    },
  },
  {
    slug: "high-body-glass-set",
    family: "curd-dahi",
    name: "High body / glass set",
    summary:
      "The firmest set in the range — curd that holds a vertical face in a glass or a bucket.",
    productSlug: "abdahi",
    codes: [{ code: "AB237NX" }, { code: "AB755NX" }, { code: "AB436NX" }],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["full-fat", "toned"],
      acidity: ["mild", "medium"],
      texture: ["firm-set", "thick"],
      flavour: ["clean"],
      probiotic: false,
    },
  },
  {
    slug: "balanced-universal",
    family: "curd-dahi",
    name: "Balanced (universal)",
    summary:
      "The default recommendation where the brief is simply good curd — balanced acidity, balanced body, tolerant of milk variation.",
    productSlug: "abdahi",
    codes: [
      { code: "AB436NX" },
      { code: "AB208NX" },
      { code: "AB407NX" },
      { code: "AB755NX" },
      { code: "AB237NX" },
    ],
    selector: {
      making: ["curd-dahi"],
      milkFat: ["full-fat", "toned", "double-toned", "low-fat"],
      acidity: ["medium", "unsure"],
      texture: ["firm-set", "creamy", "thick"],
      flavour: ["clean"],
      probiotic: false,
    },
  },
];

/* ========================= YOGHURT — 6 coded blends ========================= */

/**
 * The yoghurt range is described per code rather than grouped, because that is
 * how the client supplied it. Each descriptor below is their wording.
 */
const yoghurtProfile: CultureProfile = {
  slug: "yoghurt-range",
  family: "yoghurt",
  name: "Yoghurt",
  summary:
    "Six coded blends across the yoghurt range, separated by flavour direction and set rather than by milk profile.",
  productSlug: "abyogurt",
  codes: [
    { code: "AB152NX", note: "Buttery taste, mildly sour" },
    { code: "AB154NX", note: "Buttery taste, creamy soft" },
    { code: "AB163NX", note: "Mild, thick, set" },
    { code: "AB151NX", note: "Thick, balanced sour" },
    { code: "AB175NX", note: "Good set, slightly sour" },
    { code: "AB177NX", note: "Good taste, slightly sour" },
  ],
  selector: {
    making: ["yoghurt"],
    milkFat: ["full-fat", "toned", "double-toned", "low-fat"],
    acidity: ["mild", "medium"],
    texture: ["firm-set", "creamy", "thick"],
    flavour: ["clean", "buttery", "sweet-mild"],
    probiotic: false,
  },
};

export const cultureProfiles: readonly CultureProfile[] = [
  ...curdProfiles,
  yoghurtProfile,
];

/**
 * How milk decides the profile. The client's own selection rule, stated in the
 * spreadsheet and reproduced here because it is the first question a
 * technologist is asked and the one buyers get wrong.
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
  byMilk: [
    { milk: "Tonned milk", leadsTo: "Mild and thick set, or sweet set dahi." },
    { milk: "Low-fat milk", leadsTo: "The light and low fat profiles." },
    {
      milk: "Full-fat milk",
      leadsTo: "AB436NX, AB298NX, AB975NX, AB755NX or AB442NX.",
    },
  ],
} as const;

/** Every official code on the site, de-duplicated, in catalogue order. */
export const productCodes: readonly string[] = Array.from(
  new Set(cultureProfiles.flatMap((p) => p.codes.map((c) => c.code)))
);

export function profilesForProduct(productSlug: string): readonly CultureProfile[] {
  return cultureProfiles.filter((p) => p.productSlug === productSlug);
}

export function profileBySlug(slug: string): CultureProfile | undefined {
  return cultureProfiles.find((p) => p.slug === slug);
}

/** Culture families, for the selector's tab strip. */
export const cultureFamilies: readonly {
  readonly key: CultureFamily;
  readonly label: string;
}[] = [
  { key: "curd-dahi", label: "Curd / dahi" },
  { key: "yoghurt", label: "Yoghurt" },
];

/**
 * Flat index of every code, in catalogue order, with the profile and product
 * it belongs to. Drives the product-code rail.
 *
 * De-duplicated on the code: several codes sit in more than one taste profile
 * (AB767NX is sour, tangy AND strong sour), and the rail is a register of
 * codes, not of profile memberships. The first profile a code appears in is
 * the one shown, which is the catalogue's own order of preference.
 */
export type CodeEntry = {
  readonly code: string;
  readonly profile: CultureProfile;
  readonly note?: string;
};

export const codeIndex: readonly CodeEntry[] = (() => {
  const seen = new Set<string>();
  const out: CodeEntry[] = [];
  for (const profile of cultureProfiles) {
    for (const { code, note } of profile.codes) {
      if (seen.has(code)) continue;
      seen.add(code);
      out.push(note ? { code, profile, note } : { code, profile });
    }
  }
  return out;
})();
