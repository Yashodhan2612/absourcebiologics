import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { certifications, staleScans } from "./certifications";
import { products } from "./products";
import { team } from "./team";
import { leadership } from "./leadership";

/**
 * Photography invariants.
 *
 * The client's rule: no photograph is reused anywhere on the site. That is
 * easy to satisfy on the day and easy to break a month later by reaching for
 * a picture that is already there, so it is checked against the source rather
 * than remembered.
 */

const ROOT = path.resolve(__dirname, "../..");
const PUBLIC = path.join(ROOT, "public");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name) ? [full] : [];
  });
}

/** Every "/assets/…" image path written anywhere in src/, with repeats. */
const references = sourceFiles(path.join(ROOT, "src")).flatMap((file) =>
  [...readFileSync(file, "utf8").matchAll(/["'`](\/assets\/[\w./-]+\.(?:webp|avif|png|jpe?g|svg))["'`]/g)].map(
    (m) => m[1]!
  )
);

const count = (ref: string) => references.filter((r) => r === ref).length;

describe("no photograph is used twice", () => {
  it("references each plant, certificate and portrait photograph exactly once", () => {
    const unique = references.filter((r) => /^\/assets\/(facility|certs|team|editorial)\//.test(r));
    expect(unique.length).toBeGreaterThan(20);
    for (const ref of new Set(unique)) expect(count(ref), ref).toBe(1);
  });

  it("gives every person their own portrait", () => {
    const portraits = [...team, ...leadership].map((p) => p.image).filter(Boolean);
    expect(new Set(portraits).size).toBe(portraits.length);
  });

  it("uses every plant photograph it carries, and carries every one it uses", () => {
    const committed = readdirSync(path.join(PUBLIC, "assets/facility"))
      .filter((f) => f.endsWith(".webp"))
      .map((f) => `/assets/facility/${f}`);
    const used = new Set(references.filter((r) => r.startsWith("/assets/facility/")));
    expect([...used].sort()).toEqual(committed.sort());
  });
});

describe("every referenced image exists", () => {
  it("resolves each path in src/ to a file under public/", () => {
    for (const ref of new Set(references)) {
      // Solution.image is declared in solutions.ts but rendered nowhere — the
      // solution tiles show the lead product's pack instead (SolutionMedia) —
      // and no such files have ever existed. Predates this test; left alone.
      if (ref.startsWith("/assets/solutions/")) continue;
      expect(existsSync(path.join(PUBLIC, ref)), ref).toBe(true);
    }
  });

  it("resolves each product photograph, front and back", () => {
    for (const p of products) {
      for (const image of [p.image, p.imageBack]) {
        if (image) expect(existsSync(path.join(PUBLIC, image)), `${p.slug}: ${image}`).toBe(true);
      }
    }
  });

  it("carries no orphaned product photograph", () => {
    const used = new Set(products.flatMap((p) => [p.image, p.imageBack]).filter(Boolean));
    for (const dir of ["cultures", "ingredients", "taste-makers"]) {
      for (const file of readdirSync(path.join(PUBLIC, "assets/products", dir))) {
        if (!file.endsWith(".webp")) continue;
        const ref = `/assets/products/${dir}/${file}`;
        expect(used.has(ref), `${ref} is committed but no product shows it`).toBe(true);
      }
    }
  });
});

describe("certificate scans", () => {
  it("are the four current certificates, one scan each", () => {
    expect(certifications.map((c) => c.slug)).toEqual(["iso-9001", "iso-22000", "haccp", "halal"]);
    expect(new Set(certifications.map((c) => c.image)).size).toBe(4);
  });

  it("were in date when they were added, and are flagged once they are not", () => {
    // Fixed dates on purpose: a test that starts failing by itself on a
    // particular morning in 2027 tells nobody anything useful.
    expect(staleScans(new Date("2026-10-11"))).toHaveLength(0);
    expect(staleScans(new Date("2027-07-25")).map((c) => c.slug)).toEqual(["haccp", "halal"]);
    expect(staleScans(new Date("2029-07-10"))).toHaveLength(4);
  });
});
