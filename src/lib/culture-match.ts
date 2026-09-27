import { cultureProfiles, type CultureProfile } from "@/content/cultures";
import type { SelectorAnswers } from "./selector-engine";

/**
 * Culture-profile matching — the second half of the Culture Selector.
 *
 * selector-engine.ts answers "which PRODUCT LINE?" (ABDAHI, ABYOGURT). This
 * answers the question a technologist asks straight afterwards: "and which
 * code do I actually put on the order?"
 *
 * Kept as a separate module rather than folded into the engine on purpose.
 * The engine is covered by selector-engine.test.ts and its scoring is load
 * bearing; this is additive, scores a different set of objects, and must not
 * be able to change a product recommendation. If this file returns nothing,
 * the selector still works exactly as it did.
 *
 * Same discipline as the engine:
 *  - "What are you making" is a GATE, not a weight. A profile that does not
 *    serve the product family is disqualified rather than scored down.
 *  - An empty axis means "not applicable", never "matches everything".
 *  - Below MIN_PROFILE_CONFIDENCE we return nothing and say so, rather than
 *    naming a code we are not confident about. A wrong code is worse than no
 *    code: it is the thing the buyer types into a purchase order.
 */

export type ProfileMatch = {
  readonly profile: CultureProfile;
  readonly score: number; // 0–100
  readonly reasons: readonly string[];
};

/**
 * Weights sum to 100. Texture and acidity carry more here than in the product
 * engine because they are precisely what separates one profile from another —
 * every curd profile serves curd, so "making" cannot discriminate between them
 * once it has gated them in.
 */
export const PROFILE_WEIGHTS = {
  MAKING: 40,
  TEXTURE: 18,
  ACIDITY: 16,
  FLAVOUR: 12,
  MILK_FAT: 10,
  PROBIOTIC: 4,
} as const;

export const MIN_PROFILE_CONFIDENCE = 62;

/** "Not sure" on acidity is neutral, not disqualifying. */
const UNSURE_CREDIT = 0.5;

const MAX_PROFILE_RESULTS = 2;

function scoreAxis<T>(
  answer: T | undefined,
  supported: readonly T[],
  weight: number
): number {
  if (answer === undefined) return weight;
  if (supported.length === 0) return 0;
  return supported.includes(answer) ? weight : 0;
}

function scoreProfile(
  profile: CultureProfile,
  answers: SelectorAnswers
): ProfileMatch | null {
  const axes = profile.selector;
  const reasons: string[] = [];
  let score = 0;

  // Gate. Same reasoning as the product engine: without this a dahi profile
  // can fail the only axis that matters and still clear the threshold by
  // accumulating texture and flavour points.
  if (answers.making !== undefined) {
    if (!axes.making.includes(answers.making)) return null;
  }
  score += PROFILE_WEIGHTS.MAKING;

  const texture = scoreAxis(answers.texture, axes.texture, PROFILE_WEIGHTS.TEXTURE);
  score += texture;
  if (texture > 0 && answers.texture !== undefined) {
    reasons.push(`Sets to the ${labelTexture(answers.texture)} you asked for.`);
  }

  if (answers.acidity === "unsure") {
    score += PROFILE_WEIGHTS.ACIDITY * UNSURE_CREDIT;
  } else {
    const acidity = scoreAxis(answers.acidity, axes.acidity, PROFILE_WEIGHTS.ACIDITY);
    score += acidity;
    if (acidity > 0 && answers.acidity !== undefined) {
      reasons.push(`Lands in the ${answers.acidity} acidity band.`);
    }
  }

  const flavour = scoreAxis(answers.flavour, axes.flavour, PROFILE_WEIGHTS.FLAVOUR);
  score += flavour;
  if (flavour > 0 && answers.flavour !== undefined) {
    reasons.push(`Gives the ${labelFlavour(answers.flavour)} direction.`);
  }

  const fat = scoreAxis(answers.milkFat, axes.milkFat, PROFILE_WEIGHTS.MILK_FAT);
  score += fat;
  if (fat > 0 && answers.milkFat !== undefined) {
    reasons.push(`Built for ${labelFat(answers.milkFat)} milk.`);
  }

  if (answers.probiotic === "yes") {
    if (axes.probiotic) {
      score += PROFILE_WEIGHTS.PROBIOTIC;
      reasons.push("Carries a probiotic organism.");
    }
  } else {
    score += axes.probiotic ? 0 : PROFILE_WEIGHTS.PROBIOTIC;
  }

  return { profile, score: Math.round(score), reasons };
}

/**
 * The best-fitting taste profiles, or an empty array when none is confident.
 *
 * Empty is a valid outcome and the UI must handle it: for cheese, lassi or
 * kefir there is no coded profile catalogue at all yet, so the honest answer
 * is the product line without a code.
 */
export function recommendProfiles(answers: SelectorAnswers): readonly ProfileMatch[] {
  const scored = cultureProfiles
    .map((p) => scoreProfile(p, answers))
    .filter((m): m is ProfileMatch => m !== null)
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score < MIN_PROFILE_CONFIDENCE) return [];

  return scored
    .filter((m) => m.score >= MIN_PROFILE_CONFIDENCE)
    .slice(0, MAX_PROFILE_RESULTS);
}

/** Profiles whose parent product is this one, best first for the given answers. */
export function profileMatchesForProduct(
  productSlug: string,
  answers: SelectorAnswers
): readonly ProfileMatch[] {
  return recommendProfiles(answers).filter(
    (m) => m.profile.productSlug === productSlug
  );
}

/* ----------------------------------------------------------------- labels */

function labelTexture(value: NonNullable<SelectorAnswers["texture"]>): string {
  const map = {
    "firm-set": "firm set with a clean cut",
    creamy: "creamy, spoonable set",
    stirred: "stirred, pourable body",
    thick: "thick, high-viscosity body",
  } as const;
  return map[value];
}

function labelFlavour(value: NonNullable<SelectorAnswers["flavour"]>): string {
  const map = {
    clean: "clean and neutral",
    buttery: "buttery",
    "sweet-mild": "sweet and mild",
    "sharp-tangy": "sharp and tangy",
  } as const;
  return map[value];
}

function labelFat(value: NonNullable<SelectorAnswers["milkFat"]>): string {
  const map = {
    "full-fat": "full-fat",
    toned: "toned",
    "double-toned": "double-toned",
    "low-fat": "low-fat or skim",
  } as const;
  return map[value];
}
