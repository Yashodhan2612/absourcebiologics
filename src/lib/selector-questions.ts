import type {
  MakingAnswer,
  PackFormat,
  MilkFat,
  Acidity,
  Texture,
  Flavour,
  ProbioticNeed,
  BatchSize,
} from "@/content/types";

/**
 * The Culture Selector's questions.
 *
 * Copy discipline (Section 9): this tool talks like a dairy technologist, not
 * a chatbot. "Firm set, clean cut", never "Which texture speaks to you?".
 * No emoji, no "Great choice!". Option labels use the buyer's own vocabulary —
 * acidity in % lactic acid, volumes in litres.
 */

export type Option<T extends string> = {
  readonly value: T;
  readonly label: string;
  readonly hint?: string;
};

export const MAKING_OPTIONS: readonly Option<MakingAnswer>[] = [
  { value: "curd-dahi", label: "Curd / dahi" },
  { value: "yoghurt", label: "Yoghurt" },
  { value: "cheese", label: "Cheese" },
  { value: "paneer", label: "Paneer" },
  { value: "buttermilk-chach", label: "Buttermilk / chach" },
  { value: "lassi", label: "Lassi" },
  { value: "shrikhand", label: "Shrikhand" },
  { value: "mishti-doi", label: "Mishti doi" },
  { value: "cultured-ghee", label: "Cultured ghee" },
  { value: "kefir", label: "Kefir" },
  { value: "probiotic-functional", label: "Probiotic / functional" },
  { value: "other-fermented", label: "Other fermented food" },
];

export const PACK_FORMAT_OPTIONS: readonly Option<PackFormat>[] = [
  { value: "cup", label: "Cup" },
  { value: "pouch", label: "Pouch" },
  { value: "bucket", label: "Bucket" },
  { value: "bulk", label: "Bulk / institutional" },
];

export const MILK_FAT_OPTIONS: readonly Option<MilkFat>[] = [
  { value: "full-fat", label: "Full fat" },
  { value: "toned", label: "Toned" },
  { value: "double-toned", label: "Double toned" },
  { value: "low-fat", label: "Low fat / skim" },
];

export const ACIDITY_OPTIONS: readonly Option<Acidity>[] = [
  { value: "mild", label: "Mild", hint: "0.6–0.7% LA" },
  { value: "medium", label: "Medium", hint: "0.7–0.85% LA" },
  { value: "sharp", label: "Sharp", hint: "0.85%+ LA" },
  { value: "unsure", label: "Not sure" },
];

export const TEXTURE_OPTIONS: readonly Option<Texture>[] = [
  { value: "firm-set", label: "Firm set, clean cut" },
  { value: "creamy", label: "Creamy, spoonable" },
  { value: "stirred", label: "Stirred, pourable" },
  { value: "thick", label: "Thick, high-viscosity" },
];

export const FLAVOUR_OPTIONS: readonly Option<Flavour>[] = [
  { value: "clean", label: "Clean and neutral" },
  { value: "buttery", label: "Buttery / diacetyl" },
  { value: "sweet-mild", label: "Sweet and mild" },
  { value: "sharp-tangy", label: "Sharp and tangy" },
];

export const PROBIOTIC_OPTIONS: readonly Option<ProbioticNeed>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "maybe", label: "Maybe later" },
];

export const BATCH_SIZE_OPTIONS: readonly Option<BatchSize>[] = [
  { value: "under-500", label: "Under 500 L" },
  { value: "500-5000", label: "500–5,000 L" },
  { value: "5000-50000", label: "5,000–50,000 L" },
  { value: "over-50000", label: "Over 50,000 L" },
];

/** Question 2 is only relevant to these products (Section 9). */
const PACK_FORMAT_APPLIES_TO: readonly MakingAnswer[] = [
  "curd-dahi",
  "yoghurt",
  "lassi",
];

export type StepKey =
  | "making"
  | "packFormat"
  | "milkFat"
  | "acidity"
  | "texture"
  | "flavour"
  | "probiotic"
  | "batchSize";

export type Step = {
  readonly key: StepKey;
  readonly question: string;
  readonly options: readonly Option<string>[];
};

const ALL_STEPS: readonly Step[] = [
  { key: "making", question: "What are you making?", options: MAKING_OPTIONS },
  { key: "packFormat", question: "What pack format?", options: PACK_FORMAT_OPTIONS },
  { key: "milkFat", question: "What milk fat are you running?", options: MILK_FAT_OPTIONS },
  { key: "acidity", question: "What acidity are you targeting?", options: ACIDITY_OPTIONS },
  { key: "texture", question: "What texture do you want?", options: TEXTURE_OPTIONS },
  { key: "flavour", question: "What flavour direction?", options: FLAVOUR_OPTIONS },
  { key: "probiotic", question: "Do you need a probiotic claim?", options: PROBIOTIC_OPTIONS },
  { key: "batchSize", question: "What batch size?", options: BATCH_SIZE_OPTIONS },
];

/**
 * The step list for a given product, with the pack-format question dropped
 * where it does not apply. Computed rather than hardcoded so the wizard's
 * progress indicator always reflects the questions actually being asked.
 */
export function stepsFor(making: MakingAnswer | undefined): readonly Step[] {
  if (making && !PACK_FORMAT_APPLIES_TO.includes(making)) {
    return ALL_STEPS.filter((s) => s.key !== "packFormat");
  }
  return ALL_STEPS;
}
