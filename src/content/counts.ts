import { products, cultures, ingredients, tasteMakers } from "./products";

/**
 * Every count the site prints, derived from the catalogue.
 *
 * This file exists because the same mistake was made three times running:
 * copy that says "Fourteen culture lines" or "Twenty-two SKUs" is correct on
 * the day it is written and wrong the day a product is added. Adding FERMENTA
 * broke it, and adding ABVEGAN would have broken it again. Nothing that states
 * a count should type the number — import it from here.
 *
 * "Product lines" is the client's term for the culture range (ABDAHI,
 * ABYOGURT, ABCHEESE …). It counts lines, not the coded cultures inside them:
 * those are a different, larger number, and the two must never be conflated.
 */
export const productLineCount = cultures.length;
export const ingredientCount = ingredients.length;
export const tasteMakerCount = tasteMakers.length;
export const skuCount = products.length;

/**
 * The client's stated size of the culture portfolio: "200+ cultures".
 *
 * Defined in products.ts (which counts.ts imports, so it cannot be the other
 * way round) and re-exported here so callers have one place to import from.
 *
 * NOT derivable from the catalogue. src/content/cultures.ts lists roughly forty
 * coded cultures — only the curd and yoghurt families have been supplied — so
 * this figure comes from the client, is entered as such in stats.ts, and is
 * shown as "200+" rather than a precise count. See stats.culturesOffered.
 */
export { CULTURES_OFFERED_LABEL } from "./products";

const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
  "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five",
  "twenty-six", "twenty-seven", "twenty-eight", "twenty-nine", "thirty",
] as const;

/** 15 -> "fifteen". Falls back to digits past thirty rather than guessing. */
export function spell(n: number): string {
  return WORDS[n] ?? String(n);
}

/** 15 -> "Fifteen", for the start of a sentence. */
export function Spell(n: number): string {
  const word = spell(n);
  return word.charAt(0).toUpperCase() + word.slice(1);
}
