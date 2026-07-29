import { products } from "@/content/products";
import type {
  MakingAnswer,
  PackFormat,
  MilkFat,
  Acidity,
  Texture,
  Flavour,
  ProbioticNeed,
  BatchSize,
  Product,
} from "@/content/types";

/**
 * Culture Selector scoring.
 *
 * Pure and side-effect free so it can be unit tested exhaustively and run on
 * the server or the client identically. See selector-engine.test.ts.
 *
 * Design rules from Section 9:
 * - Additive scoring with explicitly named weights. No magic numbers.
 * - Return the top 3, never more.
 * - If the best score is below MIN_CONFIDENCE, return ZERO matches. The tool
 *   must not force a recommendation it cannot stand behind; the UI then routes
 *   the buyer to a human. This is the single most important behaviour here —
 *   a confident wrong answer costs a trial batch and the relationship.
 */

export type SelectorAnswers = {
  readonly making?: MakingAnswer;
  readonly packFormat?: PackFormat;
  readonly milkFat?: MilkFat;
  readonly acidity?: Acidity;
  readonly texture?: Texture;
  readonly flavour?: Flavour;
  readonly probiotic?: ProbioticNeed;
  readonly batchSize?: BatchSize;
};

export type Match = {
  readonly sku: string;
  readonly slug: string;
  readonly strainCode: string;
  readonly name: string;
  readonly score: number; // 0–100
  readonly reasons: readonly string[];
  readonly caveats: readonly string[];
};

/**
 * Weights sum to 100, so a score is directly a percentage of the strongest
 * possible fit. "What are you making" dominates deliberately: getting the
 * product family wrong makes every other axis irrelevant.
 */
export const WEIGHTS = {
  MAKING: 40,
  TEXTURE: 14,
  ACIDITY: 12,
  FLAVOUR: 10,
  MILK_FAT: 8,
  PACK_FORMAT: 6,
  PROBIOTIC: 6,
  BATCH_SIZE: 4,
} as const;

/** Below this, we say so rather than guessing. */
export const MIN_CONFIDENCE = 55;

/** "Not sure" on acidity should not penalise a product — award half. */
const UNSURE_CREDIT = 0.5;

/** A probiotic line used where no claim is needed is still viable, not ideal. */
const PROBIOTIC_INCIDENTAL_CREDIT = 0.5;

const MAX_RESULTS = 3;

function scoreAxis<T>(
  answer: T | undefined,
  supported: readonly T[],
  weight: number
): number {
  // Unanswered axes award full weight: an unanswered question is not evidence
  // against a product, and penalising it would rank products by how much the
  // buyer happened to fill in rather than by fit.
  if (answer === undefined) return weight;
  // An empty `supported` list means "not applicable to this SKU" and never
  // "matches everything" — otherwise the engine could manufacture a match.
  if (supported.length === 0) return 0;
  return supported.includes(answer) ? weight : 0;
}

type Scored = { product: Product; score: number; reasons: string[] };

function scoreProduct(product: Product, answers: SelectorAnswers): Scored | null {
  const profile = product.selectorProfile;
  if (!profile) return null; // Ingredients and taste makers are not selectable.

  const reasons: string[] = [];
  let score = 0;

  // --- What are you making: a GATE, not just a weight ---
  // If the buyer has told us what they are making and this SKU does not serve
  // it, the SKU is disqualified outright rather than scored down. Without this
  // a product can fail the axis that matters most and still clear
  // MIN_CONFIDENCE by accumulating texture, flavour and fat points — which is
  // how a curd culture ends up recommended for paneer. Caught by the paneer
  // case in selector-engine.test.ts; do not weaken it back to a weight.
  if (answers.making !== undefined) {
    if (!profile.making.includes(answers.making)) return null;
    score += WEIGHTS.MAKING;
    reasons.push(profile.rationale);
  } else {
    score += WEIGHTS.MAKING;
  }

  // --- Texture ---
  const textureScore = scoreAxis(answers.texture, profile.texture, WEIGHTS.TEXTURE);
  score += textureScore;
  if (textureScore > 0 && answers.texture !== undefined) {
    reasons.push(`Supports the ${labelTexture(answers.texture)} texture you asked for.`);
  }

  // --- Acidity. "Not sure" is neutral rather than disqualifying. ---
  if (answers.acidity === "unsure") {
    score += WEIGHTS.ACIDITY * UNSURE_CREDIT;
  } else {
    const acidityScore = scoreAxis(answers.acidity, profile.acidity, WEIGHTS.ACIDITY);
    score += acidityScore;
    if (acidityScore > 0 && answers.acidity !== undefined) {
      reasons.push(`Sits in the ${answers.acidity} acidity band.`);
    }
  }

  // --- Flavour ---
  const flavourScore = scoreAxis(answers.flavour, profile.flavour, WEIGHTS.FLAVOUR);
  score += flavourScore;
  if (flavourScore > 0 && answers.flavour !== undefined) {
    reasons.push(`Gives the ${labelFlavour(answers.flavour)} profile.`);
  }

  // --- Milk fat ---
  const fatScore = scoreAxis(answers.milkFat, profile.milkFat, WEIGHTS.MILK_FAT);
  score += fatScore;
  if (fatScore > 0 && answers.milkFat !== undefined) {
    reasons.push(`Runs on ${labelFat(answers.milkFat)} milk.`);
  }

  // --- Pack format ---
  score += scoreAxis(answers.packFormat, profile.packFormats, WEIGHTS.PACK_FORMAT);

  // --- Probiotic claim ---
  if (answers.probiotic === "yes") {
    // A hard requirement: a non-probiotic line cannot carry the claim.
    if (profile.probiotic) {
      score += WEIGHTS.PROBIOTIC;
      reasons.push("Carries a probiotic claim.");
    }
  } else if (answers.probiotic === undefined) {
    score += WEIGHTS.PROBIOTIC;
  } else {
    // "no" or "maybe" — a probiotic line still works, it is just not the point.
    score += profile.probiotic
      ? WEIGHTS.PROBIOTIC * PROBIOTIC_INCIDENTAL_CREDIT
      : WEIGHTS.PROBIOTIC;
  }

  // --- Batch size ---
  score += scoreAxis(answers.batchSize, profile.batchSizes, WEIGHTS.BATCH_SIZE);

  return { product, score: Math.round(score), reasons };
}

/**
 * Top 3 matches, or an empty array when nothing clears MIN_CONFIDENCE.
 *
 * An empty result is a valid, intended outcome — not an error. Asking for
 * paneer, for example, correctly returns nothing: paneer is acid- or
 * rennet-coagulated rather than fermented, so no starter culture in the range
 * is the right answer, and saying so is more useful than the nearest miss.
 */
export function recommend(answers: SelectorAnswers): readonly Match[] {
  const scored = products
    .map((p) => scoreProduct(p, answers))
    .filter((s): s is Scored => s !== null)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < MIN_CONFIDENCE) return [];

  return scored
    .filter((s) => s.score >= MIN_CONFIDENCE)
    .slice(0, MAX_RESULTS)
    .map((s) => ({
      sku: s.product.name,
      slug: s.product.slug,
      strainCode: s.product.strainCode ?? "",
      name: s.product.name,
      score: s.score,
      reasons: s.reasons.length > 0 ? s.reasons : [s.product.summary],
      caveats: s.product.selectorProfile?.caveats ?? [],
    }));
}

/* --- Label helpers, kept next to the scoring they describe ---------------- */

function labelTexture(t: Texture): string {
  return {
    "firm-set": "firm set, clean cut",
    creamy: "creamy, spoonable",
    stirred: "stirred, pourable",
    thick: "thick, high-viscosity",
  }[t];
}

function labelFlavour(f: Flavour): string {
  return {
    clean: "clean and neutral",
    buttery: "buttery, diacetyl-forward",
    "sweet-mild": "sweet and mild",
    "sharp-tangy": "sharp and tangy",
  }[f];
}

function labelFat(m: MilkFat): string {
  return {
    "full-fat": "full fat",
    toned: "toned",
    "double-toned": "double toned",
    "low-fat": "low fat / skim",
  }[m];
}
