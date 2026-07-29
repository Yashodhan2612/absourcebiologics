import { describe, it, expect } from "vitest";
import { recommend, WEIGHTS, MIN_CONFIDENCE, type SelectorAnswers } from "./selector-engine";
import { products } from "@/content/products";

/**
 * Section 15 requires sensible top-3 matches for at least twelve hand-checked
 * answer combinations, and a correct no-match for at least one edge case.
 */

describe("weights", () => {
  it("sum to 100, so a score reads directly as a percentage of best fit", () => {
    const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });
});

describe("hand-checked recommendations", () => {
  const cases: ReadonlyArray<{
    name: string;
    answers: SelectorAnswers;
    expectTop: string;
  }> = [
    {
      name: "1. firm-set cup curd on full fat",
      answers: {
        making: "curd-dahi",
        packFormat: "cup",
        milkFat: "full-fat",
        acidity: "mild",
        texture: "firm-set",
        flavour: "clean",
        probiotic: "no",
        batchSize: "5000-50000",
      },
      expectTop: "ABDAHI",
    },
    {
      name: "2. curd on double-toned milk routes to the low-fat line",
      answers: {
        making: "curd-dahi",
        packFormat: "cup",
        milkFat: "double-toned",
        acidity: "medium",
        texture: "firm-set",
        flavour: "clean",
        probiotic: "no",
        batchSize: "5000-50000",
      },
      expectTop: "ABDAHI LOW FAT",
    },
    {
      name: "3. stirred low-fat yoghurt",
      answers: {
        making: "yoghurt",
        packFormat: "cup",
        milkFat: "low-fat",
        acidity: "sharp",
        texture: "stirred",
        flavour: "sharp-tangy",
        probiotic: "no",
        batchSize: "5000-50000",
      },
      expectTop: "ABYOGURT",
    },
    {
      name: "4. cheese starter",
      answers: {
        making: "cheese",
        milkFat: "full-fat",
        acidity: "medium",
        texture: "firm-set",
        flavour: "sharp-tangy",
        probiotic: "no",
        batchSize: "5000-50000",
      },
      expectTop: "ABCHEESE",
    },
    {
      name: "5. salted chach",
      answers: {
        making: "buttermilk-chach",
        milkFat: "toned",
        acidity: "sharp",
        texture: "stirred",
        flavour: "buttery",
        probiotic: "no",
        batchSize: "5000-50000",
      },
      expectTop: "ABCHACH",
    },
    {
      name: "6. sweet lassi",
      answers: {
        making: "lassi",
        packFormat: "pouch",
        milkFat: "full-fat",
        acidity: "mild",
        texture: "thick",
        flavour: "sweet-mild",
        probiotic: "no",
        batchSize: "500-5000",
      },
      expectTop: "ABLASSI",
    },
    {
      name: "7. mishti doi",
      answers: {
        making: "mishti-doi",
        milkFat: "full-fat",
        acidity: "mild",
        texture: "creamy",
        flavour: "sweet-mild",
        probiotic: "no",
        batchSize: "500-5000",
      },
      expectTop: "ABMISHTI",
    },
    {
      name: "8. shrikhand chakka base",
      answers: {
        making: "shrikhand",
        milkFat: "full-fat",
        acidity: "medium",
        texture: "thick",
        flavour: "sweet-mild",
        probiotic: "no",
        batchSize: "500-5000",
      },
      expectTop: "ABSHRI",
    },
    {
      name: "9. cultured cream for ghee",
      answers: {
        making: "cultured-ghee",
        milkFat: "full-fat",
        acidity: "mild",
        texture: "creamy",
        flavour: "buttery",
        probiotic: "no",
        batchSize: "5000-50000",
      },
      expectTop: "ABCREAM",
    },
    {
      name: "10. probiotic claim required",
      answers: {
        making: "probiotic-functional",
        milkFat: "toned",
        acidity: "mild",
        texture: "creamy",
        flavour: "clean",
        probiotic: "yes",
        batchSize: "500-5000",
      },
      expectTop: "ABPROBIO",
    },
    {
      name: "11. kefir",
      answers: {
        making: "kefir",
        milkFat: "full-fat",
        acidity: "sharp",
        texture: "stirred",
        flavour: "sharp-tangy",
        probiotic: "yes",
        batchSize: "under-500",
      },
      expectTop: "ABKEFIR",
    },
    {
      name: "12. laban for export-style salted drink",
      answers: {
        making: "buttermilk-chach",
        milkFat: "full-fat",
        acidity: "sharp",
        texture: "thick",
        flavour: "sharp-tangy",
        probiotic: "no",
        batchSize: "500-5000",
      },
      expectTop: "ABLABAN",
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      const results = recommend(c.answers);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(3);
      expect(results[0]?.sku).toBe(c.expectTop);
      // Every match must be able to explain itself.
      for (const r of results) {
        expect(r.reasons.length).toBeGreaterThan(0);
        expect(r.score).toBeGreaterThanOrEqual(MIN_CONFIDENCE);
      }
    });
  }
});

describe("no-match behaviour", () => {
  it("returns zero matches for paneer — it is not a fermented product", () => {
    // Paneer is acid- or rennet-coagulated, not cultured. No starter culture in
    // the range is the correct answer, and the UI routes this to a human.
    const results = recommend({
      making: "paneer",
      milkFat: "full-fat",
      texture: "firm-set",
      flavour: "clean",
      probiotic: "no",
      batchSize: "5000-50000",
    });
    expect(results).toHaveLength(0);
  });

  it("does not force a recommendation when a probiotic claim cannot be met", () => {
    // Cultured ghee with a required probiotic claim: ABCREAM is not a probiotic
    // line, so it loses the probiotic weight and must not be dressed up as a fit.
    const results = recommend({
      making: "cultured-ghee",
      milkFat: "full-fat",
      acidity: "sharp",
      texture: "stirred",
      flavour: "clean",
      probiotic: "yes",
      batchSize: "under-500",
    });
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(MIN_CONFIDENCE);
    }
  });

  it("never returns more than three matches", () => {
    const results = recommend({ making: "curd-dahi" });
    expect(results.length).toBeLessThanOrEqual(3);
  });
});

describe("engine invariants", () => {
  it("never recommends a product without a selector profile", () => {
    const selectable = new Set(
      products.filter((p) => p.selectorProfile).map((p) => p.name)
    );
    const results = recommend({ making: "cheese" });
    for (const r of results) expect(selectable.has(r.sku)).toBe(true);
  });

  it("is pure — identical answers give identical results", () => {
    const answers: SelectorAnswers = { making: "yoghurt", texture: "creamy" };
    expect(recommend(answers)).toEqual(recommend(answers));
  });

  it("scores are bounded to 0–100", () => {
    const results = recommend({ making: "curd-dahi", texture: "firm-set" });
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });

  it("an unanswered selector still returns something sensible", () => {
    expect(recommend({}).length).toBeGreaterThan(0);
  });

  it("ranks in descending score order", () => {
    const results = recommend({ making: "curd-dahi", milkFat: "full-fat" });
    const scores = results.map((r) => r.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });
});

describe("top-3 sanity across every product family", () => {
  it("every culture with a profile is reachable as a top match", () => {
    // Guards against a SKU becoming unrecommendable after a profile edit.
    const reachable = new Set<string>();
    const makings = [
      "curd-dahi", "yoghurt", "cheese", "buttermilk-chach", "lassi",
      "shrikhand", "mishti-doi", "cultured-ghee", "kefir",
      "probiotic-functional", "other-fermented",
    ] as const;
    for (const making of makings) {
      for (const r of recommend({ making })) reachable.add(r.sku);
    }
    const selectable = products.filter((p) => p.selectorProfile).map((p) => p.name);
    const unreachable = selectable.filter((name) => !reachable.has(name));
    expect(unreachable).toEqual([]);
  });
});
