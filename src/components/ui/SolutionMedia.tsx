import { PackShot } from "@/components/ui/PackShot";
import { products, productsByApplication } from "@/content/products";
import { solutions } from "@/content/solutions";

/**
 * Application imagery for the eight solution families.
 *
 * There is deliberately no stock food photography here. The brief asks for
 * application photography in Indian dairy contexts and explicitly rejects
 * anything that reads as Western supermarket yoghurt; the freely-licensed
 * libraries return curries and pizza for "paneer", which would cheapen the
 * page in front of exactly the technical buyer it is written for.
 *
 * So a solution shows the real pack of the lead culture recommended for that
 * application instead. It is genuine ABsource photography, it is specific to
 * the application, and it is the thing a plant's QA manager is actually trying
 * to identify. If the client supplies real application photography later, add
 * `image` to solutions.ts and prefer it here.
 *
 * Each family shows a DIFFERENT pack. Several products are pictured in another
 * line's pack (ABDAHI (Probiotic) in ABDAHI's), so taking each family's first
 * product would put the same photograph on two tiles of one grid. Families are
 * walked in order and each takes the first of its products whose photograph an
 * earlier family has not already used.
 *
 * Kept out of PackShot.tsx on purpose. That file is imported by client
 * components, and this one needs the whole solutions catalogue; living there
 * put every solution page's copy into the browser bundle of every product
 * page.
 */
const SOLUTION_LEAD: ReadonlyMap<string, (typeof products)[number]> = (() => {
  const used = new Set<string>();
  const leads = new Map<string, (typeof products)[number]>();
  for (const solution of solutions) {
    const lead = productsByApplication(solution.slug).find(
      (p) => p.image && !used.has(p.image)
    );
    if (!lead) continue;
    used.add(lead.image);
    leads.set(solution.slug, lead);
  }
  return leads;
})();

export function SolutionMedia({
  slug,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: {
  slug: string;
  className?: string;
  sizes?: string;
}) {
  const lead = SOLUTION_LEAD.get(slug);
  return (
    <PackShot
      src={lead?.image}
      alt={lead ? `${lead.name} pack` : ""}
      seed={slug}
      className={className}
      sizes={sizes}
    />
  );
}
