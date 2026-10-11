import { describe, it, expect } from "vitest";
import {
  MAKING_OPTIONS,
  MAX_SUGGESTIONS,
  OTHER,
  UNSURE,
  poolFor,
  productSlugsOf,
  questionsFor,
  recommend,
  selectorEntries,
  type SelectorAnswers,
} from "./selector";
import {
  families,
  publicVariants,
  variants,
  variantsForProduct,
  type MakingKey,
} from "@/content/variants";
import { products } from "@/content/products";

/**
 * The Culture Selector's contract.
 *
 * Two requirements came from the client and both are pinned here: ask only the
 * questions that are relevant to the product being made, and answer with the
 * variant codes from their master sheet. The rest are the honesty rules the
 * old engine had, restated for the new one.
 */

const keysFor = (making: MakingKey, answers: SelectorAnswers = {}) =>
  questionsFor(making, answers).map((q) => q.key);

const codes = (answers: SelectorAnswers) =>
  recommend(answers)?.variants.map((v) => v.variant.code) ?? null;

/** Every combination of answers a visitor could give for one product. */
function* everyPath(making: MakingKey, answers: SelectorAnswers = { making }): Generator<SelectorAnswers> {
  const next = questionsFor(making, answers).find((q) => answers[q.key] === undefined);
  if (!next) {
    yield answers;
    return;
  }
  for (const option of next.options) {
    yield* everyPath(making, { ...answers, [next.key]: option.value });
  }
}

describe("only relevant questions are asked", () => {
  it("asks a cheese maker which cheese, and nothing else", () => {
    expect(keysFor("cheese")).toEqual(["style"]);
    // The client's own example: viscosity and acidity mean nothing for cheese.
    for (const style of families.cheese.styles!) {
      expect(keysFor("cheese", { style: style.value })).toEqual(["style"]);
    }
  });

  it("asks nothing at all where a line has nothing to choose on", () => {
    for (const making of ["mishti-doi", "kefir", "laban", "idli-dosa", "probiotic-cultures", "bioprotective-cultures"] as const) {
      expect(keysFor(making)).toEqual([]);
      expect(recommend({ making })?.kind).toBe("whole-line");
    }
  });

  it("asks a curd maker the six curd questions, the deciding one first", () => {
    expect(keysFor("curd-dahi", { probiotic: "no" })).toEqual([
      "probiotic", "pack", "milkFat", "acidity", "texture", "flavour",
    ]);
  });

  it("stops asking once an answer has settled it", () => {
    // One probiotic curd variant: there is nothing left to separate.
    expect(keysFor("curd-dahi", { probiotic: "yes" })).toEqual(["probiotic"]);
    // Nothing in the Greek-style range differs on acidity or flavour.
    expect(keysFor("yoghurt", { style: "greek", probiotic: "no" })).toEqual(["style", "probiotic"]);
    // Set yoghurt does differ on acidity, so that one is asked.
    expect(keysFor("yoghurt", { style: "set", probiotic: "no" })).toContain("acidity");
  });

  it("offers only options the product's variants actually declare", () => {
    const curd = questionsFor("curd-dahi", { probiotic: "no" });
    const values = (key: string) => curd.find((q) => q.key === key)!.options.map((o) => o.value);
    // No curd variant is described as stirred, sharp, clean or sweet.
    expect(values("texture")).not.toContain("stirred");
    expect(values("acidity")).not.toContain("sharp");
    expect(values("flavour")).toEqual(["buttery", "sharp-tangy", UNSURE]);
    expect(values("pack")).not.toContain("bulk");
  });

  it("never asks a question with fewer than two real choices", () => {
    for (const { value } of MAKING_OPTIONS) {
      for (const path of everyPath(value as MakingKey)) {
        for (const q of questionsFor(value as MakingKey, path)) {
          const real = q.options.filter((o) => o.value !== UNSURE && o.value !== OTHER);
          expect(real.length, `${value}/${q.key}`).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it("uses every configured question somewhere, so the config cannot rot", () => {
    for (const entry of selectorEntries) {
      const asked = new Set<string>();
      for (const path of everyPath(entry.key)) {
        for (const q of questionsFor(entry.key, path)) asked.add(q.key);
      }
      expect([...asked].sort(), entry.key).toEqual([...entry.questions].sort());
    }
  });
});

describe("the answer is a variant code from the master sheet", () => {
  it("names the curd variants whose descriptions match", () => {
    const result = recommend({
      making: "curd-dahi", probiotic: "no", pack: "cup", milkFat: "toned",
      acidity: "medium", texture: "firm-set", flavour: UNSURE,
    })!;
    expect(result.kind).toBe("narrowed");
    expect(result.answered).toBe(4);
    expect(result.variants[0]!.variant.code).toBe("AB201NX");
    expect(result.variants[0]!.matched).toHaveLength(4);
    expect(result.variants[0]!.productSlug).toBe("abdahi");
  });

  it("sends a low-fat curd maker to the low-fat line", () => {
    const result = recommend({
      making: "curd-dahi", probiotic: "no", pack: "pouch", milkFat: "low-fat",
      acidity: "mild", texture: "firm-set", flavour: "buttery",
    })!;
    expect(result.variants[0]!.variant.code).toBe("AB404NX");
    expect(result.variants[0]!.productSlug).toBe("abdahi-low-fat");
  });

  it("gates on the cheese variety rather than scoring it", () => {
    expect(codes({ making: "cheese", style: "mozzarella" })).toEqual(["AB516", "AB512"]);
    expect(codes({ making: "cheese", style: "cheddar" })).toEqual(["AB519", "AB520"]);
  });

  it("suggests AB704 for cultured ghee, as a variant of ABCREAM", () => {
    const result = recommend({ making: "cream-ghee", style: "ghee" })!;
    expect(result.variants.map((v) => v.variant.code)).toEqual(["AB704", "AB711"]);
    expect(productSlugsOf(result)).toEqual(["abcream"]);
    expect(variantsForProduct("abcream").map((v) => v.code)).toContain("AB704");
    expect(variantsForProduct("ab704").map((v) => v.code)).toEqual(["AB704"]);
  });

  it("routes a probiotic claim to ABDAHI (Probiotic)", () => {
    const result = recommend({ making: "curd-dahi", probiotic: "yes" })!;
    expect(result.variants.map((v) => v.variant.code)).toEqual(["AB921NX"]);
    expect(result.variants[0]!.productSlug).toBe("abdahi-probiotic");
    // The same culture is the probiotic answer whatever style of yoghurt.
    expect(codes({ making: "yoghurt", style: "set", probiotic: "yes" })).toEqual(["AB921NX"]);
    expect(codes({ making: "yoghurt", style: "greek", probiotic: "yes" })).toEqual(["AB921NX"]);
  });

  it("routes bioprotective shrikhand to ABSHRI (with ABBIO-Shield)", () => {
    const result = recommend({ making: "shrikhand", bioprotective: "yes" })!;
    expect(result.variants.map((v) => v.variant.code)).toEqual(["AB1001", "AB1002"]);
    expect(productSlugsOf(result)).toEqual(["abshri-bio-shield"]);
    expect(codes({ making: "shrikhand", bioprotective: "no", acidity: "medium" })).toEqual(["SH0102"]);
  });

  it("does not offer a probiotic variant to someone who said no", () => {
    for (const path of everyPath("buttermilk-chach")) {
      if (path.probiotic !== "no") continue;
      expect(codes(path) ?? []).not.toContain("AB946NX");
    }
  });
});

describe("honesty rules", () => {
  it("declines rather than approximating", () => {
    expect(recommend({})).toBeNull();
    expect(recommend({ making: "other" })).toBeNull();
    expect(recommend({ making: "cheese", style: OTHER })).toBeNull();
    // Nothing in the curd range is described this way.
    expect(
      recommend({
        making: "curd-dahi", probiotic: "no", pack: "bucket", milkFat: "double-toned",
        acidity: "medium", texture: "thick", flavour: "sharp-tangy",
      })
    ).toBeNull();
  });

  it("holds every ranked suggestion to the confidence floor", () => {
    let narrowed = 0;
    let declined = 0;
    for (const { value } of MAKING_OPTIONS) {
      for (const path of everyPath(value as MakingKey)) {
        const result = recommend(path);
        if (!result) {
          declined++;
          continue;
        }
        expect(result.variants.length).toBeGreaterThan(0);
        if (result.kind !== "narrowed") continue;
        narrowed++;
        const floor = result.answered >= 3 ? 2 : 1;
        expect(result.variants.length).toBeLessThanOrEqual(MAX_SUGGESTIONS);
        for (const match of result.variants) {
          expect(match.matched.length - match.conflicts.length).toBeGreaterThanOrEqual(floor);
        }
      }
    }
    // Both outcomes are real, reachable results, not dead branches.
    expect(narrowed).toBeGreaterThan(0);
    expect(declined).toBeGreaterThan(0);
  });

  it("gives no credit on an axis a variant is silent about", () => {
    // AB451NX declares pack and acidity only. Asking for toned milk must not
    // count for it — the sheet does not say which milk it suits.
    const result = recommend({
      making: "curd-dahi", probiotic: "no", pack: "cup", milkFat: "toned",
      acidity: "mild", texture: UNSURE, flavour: UNSURE,
    })!;
    const silent = result.variants.find((v) => v.variant.code === "AB451NX");
    if (silent) expect(silent.matched).not.toContain("Toned");
    expect(result.variants[0]!.matched).toHaveLength(3);
  });

  it("ignores an answer to a question that was never asked", () => {
    // Acidity is not a cheese question; a stale URL parameter changes nothing.
    expect(codes({ making: "cheese", style: "feta", acidity: "sharp", probiotic: "yes" })).toEqual(
      codes({ making: "cheese", style: "feta" })
    );
  });

  it("never suggests a withheld or pilot variant", () => {
    const withheld = new Set(
      variants.filter((v) => !publicVariants.includes(v)).map((v) => v.code)
    );
    expect(withheld.size).toBeGreaterThan(0);
    for (const { value } of MAKING_OPTIONS) {
      expect(poolFor(value as MakingKey).some((v) => withheld.has(v.code))).toBe(false);
    }
    // ABVEGAN is in pilot: none of its codes, and no way to ask for it.
    expect(publicVariants.some((v) => v.family === "vegan")).toBe(false);
    expect(MAKING_OPTIONS.map((o) => o.label.toLowerCase()).join(" ")).not.toMatch(/vegan|soya/);
  });
});

describe("the catalogue the selector reads", () => {
  it("has unique, well-formed codes", () => {
    const all = variants.map((v) => v.code);
    expect(new Set(all).size).toBe(all.length);
    for (const code of all) expect(code).toMatch(/^(AB\d{3,4}(NX)?|SH\d{4}|MD\d{4})$/);
  });

  it("points every variant at a product that exists", () => {
    const slugs = new Set(products.map((p) => p.slug));
    for (const family of Object.values(families)) expect(slugs.has(family.productSlug)).toBe(true);
    for (const v of variants) {
      for (const slug of [v.orderAs, ...(v.alsoListedOn ?? []), ...Object.values(v.orderAsFor ?? {})]) {
        if (slug) expect(slugs.has(slug), `${v.code} -> ${slug}`).toBe(true);
      }
    }
  });

  it("only uses styles its family defines", () => {
    for (const v of variants) {
      const defined = families[v.family].styles?.map((s) => s.value) ?? [];
      for (const style of v.style ?? []) expect(defined, v.code).toContain(style);
    }
  });

  it("withholds the three probiotic strains the client's sheet marks unconfirmed", () => {
    const listed = variantsForProduct("abdahi-probiotic").map((v) => v.code);
    for (const code of ["AB1405", "AB1406", "AB1407"]) expect(listed).not.toContain(code);
    expect(listed).toContain("AB1401");
  });

  it("gives every selectable product at least one variant", () => {
    for (const entry of selectorEntries) {
      if (entry.key === "other") continue;
      expect(poolFor(entry.key).length, entry.key).toBeGreaterThan(0);
    }
  });
});
