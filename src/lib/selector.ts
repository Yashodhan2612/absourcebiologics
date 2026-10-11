import {
  families,
  productSlugFor,
  publicVariants,
  type Acidity,
  type FamilyKey,
  type Flavour,
  type MakingKey,
  type MilkFat,
  type PackFormat,
  type Texture,
  type Variant,
} from "@/content/variants";
import { products } from "@/content/products";

/**
 * The Culture Selector.
 *
 * Pure and side-effect free, so it runs identically on the server and the
 * client and can be tested exhaustively — see selector.test.ts.
 *
 * WHAT CHANGED, AND WHY. The selector used to ask the same eight questions
 * whatever was being made, and score fifteen product lines against them. The
 * client's objection was exact: viscosity and acidity mean nothing for cheese,
 * so why ask. It now works from the variant catalogue instead:
 *
 *   1. Each product declares which questions apply to it (`selectorEntries`).
 *      Curd asks six. Cheese asks one — which cheese. Kefir asks none.
 *   2. A question is only ever put if the answer could still separate the
 *      variants that are left. `questionsFor` checks the data against the
 *      answers so far: a yoghurt maker who picks Greek-style is not then asked
 *      about acidity, because nothing in the Greek-style range differs on it.
 *   3. Options are limited to the values those variants actually declare. No
 *      curd variant is described as "stirred, pourable", so a curd maker is
 *      not offered it.
 *   4. The result is the variant codes to quote, with the product line each is
 *      ordered against.
 *
 * HONESTY RULES, unchanged in spirit from the old engine:
 *  - A variant gets NO credit on an axis its catalogue entry is silent about.
 *    Silence is not a match.
 *  - There is no "% fit". The result says "matches 3 of your 4 answers" and
 *    names them, because a percentage would imply a precision the catalogue's
 *    free-text descriptions do not have.
 *  - Below the confidence floor the selector returns nothing and routes the
 *    visitor to a person. A code is what gets typed onto a purchase order; a
 *    wrong one costs a trial batch.
 */

/* ------------------------------------------------------------------ types */

export type ScoredAxis = "pack" | "milkFat" | "acidity" | "texture" | "flavour";
export type GateKey = "probiotic" | "bioprotective";
export type QuestionKey = "style" | ScoredAxis | GateKey;

export const QUESTION_KEYS: readonly QuestionKey[] = [
  "style",
  "pack",
  "milkFat",
  "acidity",
  "texture",
  "flavour",
  "probiotic",
  "bioprotective",
];

/** Everything the wizard can hold. Mirrors the URL parameters one to one. */
export type SelectorAnswers = {
  readonly making?: MakingKey;
} & Partial<Record<QuestionKey, string>>;

export type Option = { readonly value: string; readonly label: string };

export type Question = {
  readonly key: QuestionKey;
  readonly question: string;
  readonly options: readonly Option[];
};

/** "Not sure" on a scored axis: skipped, neither for nor against. */
export const UNSURE = "unsure";
/** "Something else" on the style question: no catalogue answer, go to a person. */
export const OTHER = "other";

/* ------------------------------------------------------------ the entries */

/**
 * What a visitor can be making, and which questions that product warrants.
 *
 * The six curd questions are the client's own — they are listed beside the
 * curd table in the master sheet. The shorter lists were chosen by reading
 * what each family's descriptions actually distinguish on; selector.test.ts
 * asserts that every question listed here genuinely separates that family's
 * variants, so this list cannot drift away from the data.
 *
 * ORDER MATTERS. The questions that rule variants in or out (which cheese, is
 * a probiotic claim needed) come first, because their answer decides whether
 * the rest are worth asking at all: a curd maker who needs a probiotic claim
 * has one variant to choose from, and asking about pack format first would be
 * five wasted questions.
 */
export const selectorEntries: readonly {
  readonly key: MakingKey;
  readonly label: string;
  readonly families: readonly FamilyKey[];
  readonly questions: readonly QuestionKey[];
}[] = [
  {
    key: "curd-dahi",
    label: "Curd / dahi",
    families: ["curd", "low-fat-curd"],
    questions: ["probiotic", "pack", "milkFat", "acidity", "texture", "flavour"],
  },
  {
    key: "yoghurt",
    label: "Yoghurt",
    families: ["yoghurt"],
    // No flavour question: the sheet describes yoghurt flavour only as
    // "diacetyl" or not at all, which is one choice, not a question.
    questions: ["style", "probiotic", "acidity"],
  },
  {
    key: "buttermilk-chach",
    label: "Buttermilk / chach",
    families: ["buttermilk"],
    questions: ["probiotic", "acidity", "flavour"],
  },
  { key: "lassi", label: "Lassi", families: ["lassi"], questions: ["probiotic", "acidity"] },
  { key: "cheese", label: "Cheese", families: ["cheese"], questions: ["style"] },
  {
    key: "shrikhand",
    label: "Shrikhand",
    families: ["shrikhand"],
    questions: ["bioprotective", "acidity"],
  },
  { key: "mishti-doi", label: "Mishti doi", families: ["mishti-doi"], questions: [] },
  { key: "cream-ghee", label: "Cream & cultured ghee", families: ["cream"], questions: ["style"] },
  { key: "kefir", label: "Kefir", families: ["kefir"], questions: [] },
  { key: "laban", label: "Laban", families: ["laban"], questions: [] },
  { key: "idli-dosa", label: "Idli / dosa batter", families: ["idli-dosa"], questions: [] },
  { key: "probiotic-cultures", label: "Probiotic cultures", families: ["probiotics"], questions: [] },
  {
    key: "bioprotective-cultures",
    label: "Bioprotective cultures",
    families: ["bioprotective"],
    questions: [],
  },
  // No families: there is no catalogue answer, so this goes straight to the
  // "we would rather look at this properly" outcome. Paneer used to be listed
  // and returned nothing by design, since it is not a cultured product; it is
  // not offered now, and a paneer maker lands here.
  { key: "other", label: "Something else", families: [], questions: [] },
];

export const MAKING_OPTIONS: readonly Option[] = selectorEntries.map((e) => ({
  value: e.key,
  label: e.label,
}));

/* ----------------------------------------------------------------- labels */

const AXIS_QUESTION: Record<ScoredAxis | GateKey, string> = {
  pack: "What pack format?",
  milkFat: "What milk are you running?",
  acidity: "What acidity are you targeting?",
  texture: "What texture do you want?",
  flavour: "What flavour direction?",
  probiotic: "Do you need a probiotic claim?",
  bioprotective: "Do you want bioprotective strains, for a longer shelf life?",
};

const STYLE_QUESTION: Partial<Record<MakingKey, string>> = {
  cheese: "Which cheese are you making?",
  yoghurt: "What style of yoghurt?",
  "cream-ghee": "What are you making from the cream?",
};

/** Canonical order and wording. A question shows only the ones in use. */
const AXIS_OPTIONS: {
  pack: readonly { value: PackFormat; label: string }[];
  milkFat: readonly { value: MilkFat; label: string }[];
  acidity: readonly { value: Acidity; label: string }[];
  texture: readonly { value: Texture; label: string }[];
  flavour: readonly { value: Flavour; label: string }[];
} = {
  pack: [
    { value: "cup", label: "Cup" },
    { value: "pouch", label: "Pouch" },
    { value: "bucket", label: "Bucket" },
    { value: "bulk", label: "Bulk / institutional" },
  ],
  milkFat: [
    { value: "full-fat", label: "Full fat" },
    { value: "toned", label: "Toned" },
    { value: "double-toned", label: "Double toned" },
    { value: "low-fat", label: "Low fat / skim" },
  ],
  acidity: [
    { value: "mild", label: "Mild" },
    { value: "medium", label: "Medium" },
    { value: "sharp", label: "Sharp / sour" },
  ],
  texture: [
    { value: "firm-set", label: "Firm set, clean cut" },
    { value: "creamy", label: "Creamy, spoonable" },
    { value: "stirred", label: "Stirred, pourable" },
    { value: "thick", label: "Thick, high viscosity" },
  ],
  flavour: [
    { value: "clean", label: "Clean and neutral" },
    { value: "buttery", label: "Buttery / diacetyl" },
    { value: "sweet-mild", label: "Sweet and mild" },
    { value: "sharp-tangy", label: "Sharp and tangy" },
  ],
};

const SCORED: readonly ScoredAxis[] = ["pack", "milkFat", "acidity", "texture", "flavour"];

function isScored(key: QuestionKey): key is ScoredAxis {
  return (SCORED as readonly string[]).includes(key);
}

function axisLabel(axis: ScoredAxis, value: string): string {
  return AXIS_OPTIONS[axis].find((o) => o.value === value)?.label ?? value;
}

/* ------------------------------------------------------------------- pool */

function entryFor(making: MakingKey | undefined) {
  return selectorEntries.find((e) => e.key === making);
}

/** Every variant that could be suggested for this product. */
export function poolFor(making: MakingKey | undefined): readonly Variant[] {
  const entry = entryFor(making);
  if (!entry || !making) return [];
  return publicVariants.filter(
    (v) => entry.families.includes(v.family) || (v.alsoMaking?.includes(making) ?? false)
  );
}

function declared(variant: Variant, axis: ScoredAxis): readonly string[] {
  return variant[axis] ?? [];
}

/* -------------------------------------------------------------- questions */

function styleOptions(candidates: readonly Variant[]): readonly Option[] {
  const inUse = new Set(candidates.flatMap((v) => v.style ?? []));
  const ordered: Option[] = [];
  const seen = new Set<string>();
  // Sheet order, taken from each family in turn.
  for (const variant of candidates) {
    for (const style of families[variant.family].styles ?? []) {
      if (inUse.has(style.value) && !seen.has(style.value)) {
        seen.add(style.value);
        ordered.push(style);
      }
    }
  }
  return ordered;
}

/** The question for `key`, or null when it could not separate `candidates`. */
function buildQuestion(
  key: QuestionKey,
  candidates: readonly Variant[],
  making: MakingKey
): Question | null {
  if (key === "style") {
    const options = styleOptions(candidates);
    if (options.length < 2) return null;
    return {
      key,
      question: STYLE_QUESTION[making] ?? "Which type?",
      options: [...options, { value: OTHER, label: "Something else" }],
    };
  }

  if (key === "probiotic" || key === "bioprotective") {
    const withIt = candidates.filter((v) => v[key]).length;
    if (withIt === 0 || withIt === candidates.length) return null;
    return {
      key,
      question: AXIS_QUESTION[key],
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    };
  }

  // A scored axis needs two different declared values to be a real question.
  // "What flavour? Buttery / not sure" is not one.
  const inUse = new Set(candidates.flatMap((v) => declared(v, key)));
  if (inUse.size < 2) return null;
  return {
    key,
    question: AXIS_QUESTION[key],
    options: [
      ...AXIS_OPTIONS[key].filter((o) => inUse.has(o.value)),
      { value: UNSURE, label: "Not sure / no preference" },
    ],
  };
}

/**
 * Apply one answer as a filter. Only the gates filter: a wrong cheese variety
 * or a missing probiotic claim is not a lower score, it is the wrong product.
 * Scored axes never remove a variant here — they rank, in recommend().
 *
 * A variant that is silent on style passes the style gate. AB921NX is listed
 * for "curd / yoghurt" with no style, and it must stay the probiotic answer
 * whichever style of yoghurt is being made.
 */
function applyGate(
  candidates: readonly Variant[],
  key: QuestionKey,
  answer: string | undefined
): readonly Variant[] {
  if (answer === undefined) return candidates;
  if (key === "style") {
    if (answer === OTHER) return [];
    return candidates.filter((v) => !v.style?.length || v.style.includes(answer));
  }
  if (key === "probiotic" || key === "bioprotective") {
    if (answer === "yes") return candidates.filter((v) => v[key]);
    if (answer === "no") return candidates.filter((v) => !v[key]);
  }
  return candidates;
}

/**
 * Walk a product's configured questions against the answers so far.
 *
 * Each question is built from the variants still standing when it is reached,
 * so it is asked only if it can separate THEM, and offers only what THEY
 * declare. An answer to a question that was never asked is ignored, which is
 * what makes a stale or hand-edited URL harmless.
 */
function walk(answers: SelectorAnswers): {
  readonly questions: readonly Question[];
  readonly candidates: readonly Variant[];
} {
  const making = answers.making;
  const entry = entryFor(making);
  let candidates = poolFor(making);
  if (!entry || !making || candidates.length === 0) return { questions: [], candidates: [] };

  const questions: Question[] = [];
  for (const key of entry.questions) {
    const question = buildQuestion(key, candidates, making);
    if (!question) continue;
    questions.push(question);
    const answer = answers[key];
    const offered = answer !== undefined && question.options.some((o) => o.value === answer);
    candidates = applyGate(candidates, key, offered ? answer : undefined);
  }
  return { questions, candidates };
}

/**
 * The questions for a product, in order, given what has been answered so far.
 *
 * This is the mechanism behind "do not ask what is not relevant": relevance is
 * read off the data. The list can get shorter as answers arrive, never longer
 * than the product's configured set.
 */
export function questionsFor(
  making: MakingKey | undefined,
  answers: SelectorAnswers = {}
): readonly Question[] {
  return walk({ ...answers, making }).questions;
}

/* ---------------------------------------------------------------- matching */

export type VariantMatch = {
  readonly variant: Variant;
  /** The product line to order it against, in this context. */
  readonly productSlug: string;
  readonly productName: string;
  /** The visitor's answers this variant's description agrees with. */
  readonly matched: readonly string[];
  /** Answers its description contradicts. */
  readonly conflicts: readonly string[];
};

export type Recommendation = {
  /**
   * "narrowed"   — answers separated the variants; `variants` is ranked.
   * "whole-line" — nothing to separate on (no questions, or every answer was
   *                "not sure"), so the line's variants are listed unranked.
   */
  readonly kind: "narrowed" | "whole-line";
  /** How many scored answers the visitor gave. Zero for "whole-line". */
  readonly answered: number;
  /** Suggested variants, best first. */
  readonly variants: readonly VariantMatch[];
  /**
   * How many more are not shown: for "narrowed", others that fit about as well
   * as the ones listed; for "whole-line", the rest of the line.
   */
  readonly remaining: number;
};

/** Most suggestions shown for a ranked result. */
export const MAX_SUGGESTIONS = 3;
/** A line with no questions lists all of its variants, up to this many. */
export const MAX_WHOLE_LINE = 12;

function productName(slug: string): string {
  return products.find((p) => p.slug === slug)?.name ?? slug.toUpperCase();
}

function toMatch(
  variant: Variant,
  making: MakingKey,
  matched: readonly string[] = [],
  conflicts: readonly string[] = []
): VariantMatch {
  const productSlug = productSlugFor(variant, making);
  return { variant, productSlug, productName: productName(productSlug), matched, conflicts };
}

/**
 * The variants to suggest, or null when the catalogue has no confident answer.
 *
 * Null is a designed outcome, not an error: it is what "Something else", an
 * unlisted cheese, or a combination nothing in the range is described as
 * should produce.
 */
export function recommend(answers: SelectorAnswers): Recommendation | null {
  const making = answers.making;
  if (!making) return null;

  // Gates are applied by the walk; what comes back has already passed them.
  const { questions, candidates } = walk(answers);
  if (candidates.length === 0) return null;

  // --- Scored axes: only the ones actually asked, and only real answers.
  const given = questions
    .map((q) => q.key)
    .filter(isScored)
    .filter((axis) => {
      const answer = answers[axis];
      return answer !== undefined && answer !== UNSURE;
    });

  if (given.length === 0) {
    const shown = candidates.slice(0, MAX_WHOLE_LINE);
    return {
      kind: "whole-line",
      answered: 0,
      variants: shown.map((v) => toMatch(v, making)),
      remaining: candidates.length - shown.length,
    };
  }

  const scored = candidates.map((variant, order) => {
    const matched: string[] = [];
    const conflicts: string[] = [];
    for (const axis of given) {
      const answer = answers[axis] as string;
      const says = declared(variant, axis);
      if (says.length === 0) continue; // silent: no credit, no penalty
      (says.includes(answer) ? matched : conflicts).push(axisLabel(axis, answer));
    }
    return { variant, order, matched, conflicts, net: matched.length - conflicts.length };
  });

  // The floor. With three or more answers, one agreement is a coincidence.
  const floor = given.length >= 3 ? 2 : 1;
  const best = Math.max(...scored.map((s) => s.net));
  if (best < floor) return null;

  // Only the best fit and anything one answer behind it. Further back than
  // that is a different product that happens to share a pack format.
  const cutoff = Math.max(floor, best - 1);
  const close = scored
    .filter((s) => s.net >= cutoff)
    .sort(
      (a, b) =>
        b.net - a.net || b.matched.length - a.matched.length || a.order - b.order
    );

  const shown = close.slice(0, MAX_SUGGESTIONS);
  return {
    kind: "narrowed",
    answered: given.length,
    variants: shown.map((s) => toMatch(s.variant, making, s.matched, s.conflicts)),
    remaining: close.length - shown.length,
  };
}

/** The product lines a recommendation points at, first-suggested first. */
export function productSlugsOf(recommendation: Recommendation): readonly string[] {
  return [...new Set(recommendation.variants.map((v) => v.productSlug))];
}
