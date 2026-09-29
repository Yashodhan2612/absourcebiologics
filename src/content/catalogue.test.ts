import { describe, it, expect } from "vitest";
import { products, cultures, CATEGORY_COPY, CULTURES_OFFERED_LABEL } from "./products";
import { productLineCount, skuCount, spell, Spell } from "./counts";
import { stats } from "./stats";
import { recommend } from "@/lib/selector-engine";
import { solutions } from "./solutions";
import { downloads } from "./downloads";
import { primaryNav, footerNav } from "./nav";
import * as company from "./company";
import { leadership } from "./leadership";

/**
 * Catalogue and copy invariants.
 *
 * These exist because each of them was broken at least once by a change that
 * looked complete. A count was typed into copy and went stale when a product
 * was added — twice. Placeholder product codes were "removed" and were still
 * sitting in eleven sentences of solution copy and three data-sheet titles.
 * Each test below is a mistake that already happened.
 */

const everything = JSON.stringify({
  products,
  solutions,
  downloads,
  primaryNav,
  footerNav,
  company,
  leadership,
});

describe("counts", () => {
  it("derives the product-line count from the catalogue", () => {
    expect(productLineCount).toBe(cultures.length);
    expect(stats.productLines.value).toBe(cultures.length);
    expect(skuCount).toBe(products.length);
  });

  it("includes ABVEGAN, making fifteen lines", () => {
    expect(cultures.map((p) => p.slug)).toContain("abvegan");
    expect(productLineCount).toBe(15);
  });

  it("spells numbers, and falls back to digits rather than guessing", () => {
    expect(spell(15)).toBe("fifteen");
    expect(Spell(23)).toBe("Twenty-three");
    expect(spell(41)).toBe("41");
  });

  it("keeps product slugs unique across categories", () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("the culture range is labelled as product lines", () => {
  const { filter, item, name } = CATEGORY_COPY.cultures!;

  it("says Product lines, with the DVS descriptor and the size of the range", () => {
    expect(name).toBe("Product lines");
    expect(filter).toContain("Product lines");
    expect(filter).toContain("DVS starter cultures");
    expect(filter).toContain(CULTURES_OFFERED_LABEL);
  });

  it("uses the singular per item, without repeating the portfolio size", () => {
    expect(item).toBe("Product line (DVS starter culture)");
    expect(item).not.toContain("200");
  });

  it("no longer names the category 'DVS starter cultures' on its own", () => {
    for (const label of [name, filter, item]) {
      expect(label).not.toBe("DVS starter cultures");
    }
  });

  it("shows the full label in the navigation and the footer", () => {
    const products = primaryNav.find((i) => i.label === "Products");
    const link = products?.children?.find((c) => c.href.includes("category=cultures"));
    expect(link?.label).toBe(filter);

    const footer = footerNav
      .find((s) => s.title === "Products")
      ?.links.find((l) => l.href.includes("category=cultures"));
    expect(footer?.label).toBe(filter);
  });
});

describe("200+ cultures", () => {
  it("is a verified, client-stated stat shown as 200+", () => {
    expect(stats.culturesOffered.verified).toBe(true);
    expect(stats.culturesOffered.display).toBe("200+");
    expect(CULTURES_OFFERED_LABEL).toBe("200+");
  });
});

describe("ABVEGAN is a pilot product and behaves like one", () => {
  const vegan = products.find((p) => p.slug === "abvegan")!;

  it("exists, in the culture category, marked as a pilot", () => {
    expect(vegan).toBeDefined();
    expect(vegan.category).toBe("cultures");
    expect(vegan.availability).toBe("pilot");
  });

  it("says it is new, in testing and launching soon", () => {
    expect(vegan.description).toMatch(/early stages of testing and in pilot/i);
    expect(vegan.description).toMatch(/launch and be available soon/i);
  });

  it("carries no specification, no applications and no comparative claims", () => {
    expect(vegan.specs).toHaveLength(0);
    expect(vegan.applications).toHaveLength(0);
    expect(vegan.versusImported).toHaveLength(0);
  });

  it("can never be recommended by the Culture Selector", () => {
    expect(vegan.selectorProfile).toBeNull();
    for (const making of [
      "curd-dahi", "yoghurt", "cheese", "buttermilk-chach", "lassi", "shrikhand",
      "mishti-doi", "cultured-ghee", "kefir", "probiotic-functional", "other-fermented",
    ] as const) {
      expect(recommend({ making }).map((m) => m.slug)).not.toContain("abvegan");
    }
    expect(recommend({}).map((m) => m.slug)).not.toContain("abvegan");
  });

  it("is the only pilot product, so a stray flag cannot hide another SKU", () => {
    expect(products.filter((p) => p.availability === "pilot").map((p) => p.slug)).toEqual([
      "abvegan",
    ]);
  });
});

describe("FERMENTA's label", () => {
  const fermenta = products.find((p) => p.slug === "fermenta")!;

  it("is a label, not a sachet photograph, so it stays off the 3D model", () => {
    expect(fermenta.imageKind).toBe("label");
    expect(fermenta.image).toMatch(/fermenta-label-front/);
    expect(fermenta.imageBack).toMatch(/fermenta-label-back/);
  });

  it("is the only product with a label rather than pack artwork", () => {
    expect(products.filter((p) => p.imageKind === "label")).toHaveLength(1);
  });
});

describe("corrections that must stay corrected", () => {
  it("never mentions Avanira", () => {
    expect(everything).not.toMatch(/avanira/i);
  });

  it("never claims to be a group company of BioResource Biotech", () => {
    expect(everything).not.toMatch(/group company/i);
    expect(everything).not.toMatch(/parentOrganization/i);
  });

  it("does not carry the retired placeholder product codes in any copy", () => {
    expect(everything).not.toMatch(
      /\b(CU01|LF01|YC01|BU01|LB01|CH01|LA01|MD01|SH01|CR01|PB01|KF01|BS01)\b/
    );
  });

  it("does not print a stale hardcoded count", () => {
    expect(everything).not.toMatch(/\b(Fourteen|Twenty-two)\b/);
    expect(everything).not.toMatch(/\bfourteen culture lines\b/i);
  });
});
