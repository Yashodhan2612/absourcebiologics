import { describe, it, expect } from "vitest";
import {
  products,
  cultures,
  girCowGhee,
  ingredients,
  tasteMakers,
  productBySlug,
  productsByApplication,
  CATEGORY_COPY,
  CULTURES_OFFERED_LABEL,
} from "./products";
import { productLineCount, skuCount, spell, Spell } from "./counts";
import { stats } from "./stats";
import { MAKING_OPTIONS, recommend } from "@/lib/selector";
import { variants } from "./variants";
import { featuredCultures } from "./featured";
import { PRODUCT_REDIRECTS } from "../../next.config";
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
  variants,
  solutions,
  downloads,
  featuredCultures,
  primaryNav,
  footerNav,
  company,
  leadership,
});

const bySlug = (slug: string) => products.find((p) => p.slug === slug)!;

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

  it("accounts for every SKU in exactly one category", () => {
    expect(
      cultures.length + girCowGhee.length + ingredients.length + tasteMakers.length
    ).toBe(skuCount);
    expect(skuCount).toBe(24);
    for (const p of products) expect(CATEGORY_COPY[p.category], p.slug).toBeDefined();
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

  it("carries no specification and no comparative claims", () => {
    expect(vegan.specs).toHaveLength(0);
    expect(vegan.versusImported).toHaveLength(0);
  });

  it("is the one product under the Vegan application filter, and on no solution page", () => {
    expect(vegan.applications).toEqual(["vegan"]);
    expect(productsByApplication("vegan").map((p) => p.slug)).toEqual(["abvegan"]);
    expect(solutions.map((s) => s.slug as string)).not.toContain("vegan");
  });

  it("can never be recommended by the Culture Selector", () => {
    for (const { value } of MAKING_OPTIONS) {
      const result = recommend({ making: value as never });
      expect(result?.variants.map((v) => v.productSlug) ?? []).not.toContain("abvegan");
    }
  });

  it("is the only pilot product, so a stray flag cannot hide another SKU", () => {
    expect(products.filter((p) => p.availability === "pilot").map((p) => p.slug)).toEqual([
      "abvegan",
    ]);
  });
});

describe("the catalogue changes of October 2026", () => {
  it("renames ABPROBIO and ABBIO-SHIELD, in the packs the client asked for", () => {
    const probiotic = bySlug("abdahi-probiotic");
    expect(probiotic.name).toBe("ABDAHI (Probiotic)");
    expect(probiotic.image).toBe(bySlug("abdahi").image);

    const shield = bySlug("abshri-bio-shield");
    expect(shield.name).toBe("ABSHRI (with ABBIO-Shield)");
    expect(shield.image).toBe(bySlug("abshri").image);
    expect(shield.description).toMatch(/shelf life of chakka by three weeks/);
  });

  it("lists those two under Probiotics & functional and nowhere else", () => {
    for (const slug of ["abdahi-probiotic", "abshri-bio-shield"]) {
      expect(bySlug(slug).applications).toEqual(["probiotics-functional"]);
    }
    for (const tag of ["curd-dahi", "yoghurt", "fermented-foods-beverages", "shrikhand-mishti-doi"]) {
      const listed = productsByApplication(tag).map((p) => p.slug);
      expect(listed).not.toContain("abdahi-probiotic");
      expect(listed).not.toContain("abshri-bio-shield");
    }
  });

  it("files FERMENTA under fermented foods and beverages, with ABDAHI's specification", () => {
    const fermenta = bySlug("fermenta");
    expect(fermenta.applications).toEqual(["fermented-foods-beverages"]);
    expect(fermenta.description).toMatch(/idli and dosa batter/);
    expect(fermenta.description).toMatch(/no in-house propagation step/);

    // Same technical rows as ABDAHI. The one row it drops is the note about
    // colour-coded catalogue artwork, which is not true of its own sachet.
    const dahi = bySlug("abdahi").specs.filter((r) => r.label !== "Pack artwork");
    expect(fermenta.specs).toEqual(dahi);
  });

  it("shows FERMENTA's own sachet, which stays off the 3D model", () => {
    const fermenta = bySlug("fermenta");
    expect(fermenta.imageKind).toBe("photo");
    expect(fermenta.imageBack).toMatch(/fermenta-label-back/);
    expect(fermenta.substrate).toBe("batter");
    expect(products.filter((p) => p.imageKind === "photo")).toHaveLength(1);
  });

  it("describes ABRENNO as a rennet for cheese, with no mention of paneer", () => {
    const renno = bySlug("abrenno");
    expect(renno.summary).toBe("Microbial rennet for cheese");
    // Its copy, not its tags: "cheese-paneer" is the name of the solution
    // family it is filed under, which is not a statement about the product.
    expect(`${renno.summary} ${renno.description} ${JSON.stringify(renno.specs)}`).not.toMatch(
      /paneer/i
    );
    // Nor anywhere it is named in solution copy.
    const copy = solutions.flatMap((s) => [
      s.headline,
      s.summary,
      ...s.challenge,
      ...s.faqs.flatMap((f) => [f.q, f.a]),
    ]);
    for (const sentence of copy.flatMap((text) => text.split(/(?<=[.?!])\s+/))) {
      if (/ABRENNO/.test(sentence)) expect(sentence, sentence).not.toMatch(/paneer/i);
    }
  });

  it("renames ABBIND to ABMAX and ABBINDMAX to ABMERGE+", () => {
    expect(bySlug("abmax").name).toBe("ABMAX");
    expect(bySlug("abmerge-plus").name).toBe("ABMERGE+");
  });

  it("withdraws ABHIPRO and ABBLEND, and every retired name, from all copy", () => {
    expect(everything).not.toMatch(/ABHIPRO|ABBLEND|ABPROBIO|ABBINDMAX|ABBIND\b/i);
    // "ABBIO-Shield" lives on as the name of the bioprotective strains inside
    // ABSHRI (with ABBIO-Shield). The old all-capitals product name does not.
    expect(everything).not.toMatch(/ABBIO-SHIELD/);
  });

  it("puts AB704 alone in Gir Cow Ghee, with ABCREAM's photograph and description", () => {
    expect(girCowGhee.map((p) => p.slug)).toEqual(["ab704"]);
    const ab704 = bySlug("ab704");
    const cream = bySlug("abcream");
    expect(ab704.image).toBe(cream.image);
    expect(ab704.description).toBe(cream.description);
    expect(ab704.applications).toEqual([]);
    expect(CATEGORY_COPY["gir-cow-ghee"]!.filter).toBe("Gir Cow Ghee");
    expect(productBySlug("gir-cow-ghee", "ab704")).toBeDefined();
  });

  it("splits ABSPICE and ABMERGE into a 1 kg pouch and a 25 kg bag, same specification", () => {
    for (const base of ["abspice", "abmerge"]) {
      const pouch = bySlug(`${base}-1kg`);
      const bag = bySlug(`${base}-25kg`);
      expect(pouch.name).toMatch(/\(1 kg pouch\)$/);
      expect(bag.name).toMatch(/\(25 kg bag\)$/);
      expect(pouch.description).toBe(bag.description);
      expect(pouch.applications).toEqual(bag.applications);
      // Identical apart from the row that says which pack it is.
      const rest = (p: typeof pouch) => p.specs.filter((r) => r.label !== "Pack size");
      expect(rest(pouch)).toEqual(rest(bag));
      expect(pouch.image).not.toBe(bag.image);
      expect(products.find((p) => p.slug === base)).toBeUndefined();
    }
  });
});

describe("photographs", () => {
  it("never shares a product photograph unless the sharing is declared", () => {
    const owners = new Map<string, string>();
    for (const p of products) {
      if (!p.image || p.packOf) continue;
      expect(owners.get(p.image), `${p.slug} reuses ${owners.get(p.image)}'s photograph`).toBeUndefined();
      owners.set(p.image, p.slug);
    }
    // And a declared borrower really does show the pack it names.
    for (const p of products) {
      if (p.packOf) expect(p.image, p.slug).toBe(bySlug(p.packOf).image);
    }
  });

  it("shows a different pack on every solution tile", () => {
    // Mirrors SolutionMedia: each family takes its first not-yet-used pack.
    const used = new Set<string>();
    for (const solution of solutions) {
      const lead = productsByApplication(solution.slug).find((p) => p.image && !used.has(p.image));
      expect(lead, solution.slug).toBeDefined();
      used.add(lead!.image);
    }
    expect(used.size).toBe(solutions.length);
  });
});

describe("redirects for renamed and withdrawn products", () => {
  const routeOf = (path: string) => /^\/products\/([^/?]+)\/([^/?]+)$/.exec(path);

  it("sends every old URL to a page that exists", () => {
    for (const { source, destination } of PRODUCT_REDIRECTS) {
      const from = routeOf(source)!;
      expect(productBySlug(from[1]!, from[2]!), `${source} is still live`).toBeUndefined();
      const to = routeOf(destination);
      if (to) expect(productBySlug(to[1]!, to[2]!), destination).toBeDefined();
      else expect(destination).toMatch(/^\/products\?category=(cultures|ingredients|taste-makers)$/);
    }
  });

  it("covers every slug this change removed", () => {
    const sources = PRODUCT_REDIRECTS.map((r) => r.source.split("/").pop());
    for (const slug of ["abprobio", "abbio-shield", "abbind", "abbindmax", "abmerge", "abspice", "abhipro", "abblend"]) {
      expect(sources).toContain(slug);
    }
  });
});

describe("featured cultures", () => {
  it("links each card to a product page that exists", () => {
    for (const item of featuredCultures) {
      const product = bySlug(item.slug);
      expect(product, item.slug).toBeDefined();
      expect(item.href).toBe(`/products/${product.category}/${product.slug}`);
    }
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
