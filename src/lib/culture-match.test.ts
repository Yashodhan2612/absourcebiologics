import { describe, it, expect } from "vitest";
import { recommendProfiles, MIN_PROFILE_CONFIDENCE } from "./culture-match";
import { cultureProfiles, codeIndex } from "@/content/cultures";
import type { SelectorAnswers } from "./selector-engine";

/**
 * Culture-profile matching.
 *
 * The client's requirement was that a given set of answers "must always lead
 * to the correct product". These pin the mappings that a dairy technologist
 * would consider obviously right or obviously wrong — the ones where a bad
 * answer costs a trial batch.
 */

const top = (answers: SelectorAnswers) => recommendProfiles(answers)[0]?.profile.slug;

describe("recommendProfiles", () => {
  it("sends a sharp, thick, tangy curd to a sour profile", () => {
    const slug = top({
      making: "curd-dahi",
      acidity: "sharp",
      texture: "thick",
      flavour: "sharp-tangy",
    });
    expect(["sour-thick", "strong-sour", "tangy-cooking"]).toContain(slug);
  });

  it("sends low-fat milk to the low-fat profile", () => {
    expect(
      top({ making: "curd-dahi", milkFat: "low-fat", texture: "firm-set" })
    ).toBe("light-low-fat");
  });

  it("sends a sweet, firm, mild set to sweet set dahi", () => {
    expect(
      top({
        making: "curd-dahi",
        acidity: "mild",
        texture: "firm-set",
        flavour: "sweet-mild",
        milkFat: "full-fat",
      })
    ).toBe("sweet-set-dahi");
  });

  it("returns a probiotic profile when a probiotic claim is required", () => {
    const matches = recommendProfiles({
      making: "curd-dahi",
      probiotic: "yes",
      texture: "firm-set",
      acidity: "mild",
    });
    expect(matches.some((m) => m.profile.selector.probiotic)).toBe(true);
  });

  it("sends full-fat creamy curd to the creamy profile", () => {
    expect(
      top({
        making: "curd-dahi",
        milkFat: "full-fat",
        texture: "creamy",
        flavour: "buttery",
      })
    ).toBe("creamy-rich");
  });

  it("keeps yoghurt answers in the yoghurt range", () => {
    expect(top({ making: "yoghurt", texture: "creamy" })).toBe("yoghurt-range");
  });

  /**
   * The gate. Asking about a product family with no coded catalogue must
   * return nothing rather than the nearest curd profile — a code is what gets
   * typed onto a purchase order, and a wrong one is worse than none.
   */
  it.each(["paneer", "cheese", "kefir", "cultured-ghee"] as const)(
    "returns no code for %s, which has no coded catalogue",
    (making) => {
      expect(recommendProfiles({ making })).toHaveLength(0);
    }
  );

  it("never returns a match below the confidence floor", () => {
    const matches = recommendProfiles({
      making: "curd-dahi",
      acidity: "sharp",
      texture: "creamy",
      flavour: "sweet-mild",
      milkFat: "low-fat",
    });
    for (const m of matches) expect(m.score).toBeGreaterThanOrEqual(MIN_PROFILE_CONFIDENCE);
  });

  it("never returns a profile for a family it does not serve", () => {
    for (const m of recommendProfiles({ making: "yoghurt" })) {
      expect(m.profile.selector.making).toContain("yoghurt");
    }
  });
});

describe("the catalogue itself", () => {
  it("only uses official AB codes, never the retired placeholders", () => {
    for (const { code } of codeIndex) {
      expect(code).toMatch(/^AB\d{3}(NX|SQII)$/);
    }
  });

  it("points every profile at a product line that exists", async () => {
    const { products } = await import("@/content/products");
    const slugs = new Set(products.map((p) => p.slug));
    for (const profile of cultureProfiles) {
      expect(slugs.has(profile.productSlug)).toBe(true);
    }
  });

  it("de-duplicates codes that appear in several profiles", () => {
    const codes = codeIndex.map((e) => e.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
