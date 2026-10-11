import { products } from "@/content/products";
import { codeIndex, productSlugFor } from "@/content/variants";
import { ProductCodeRail, type CodeRailEntry } from "./ProductCodeRail";

/**
 * The product code rail, with its data.
 *
 * A server component: it resolves every public variant code to the product
 * line it is ordered against and hands the result to the client rail. Doing
 * the lookup here keeps the catalogue out of the browser bundle.
 *
 * Each code links to its product line, because a code is a sub-category of a
 * product: AB436NX is a way of buying ABDAHI, not a separate SKU. Codes never
 * get their own pages.
 */
const ENTRIES: readonly CodeRailEntry[] = codeIndex.map((variant) => {
  const slug = productSlugFor(variant);
  const product = products.find((p) => p.slug === slug);
  return {
    code: variant.code,
    href: product ? `/products/${product.category}/${product.slug}` : "/products",
    descriptor: variant.descriptor,
  };
});

export function ProductCodeIndex({
  mode = "ticker",
  className,
}: {
  mode?: "ticker" | "sticky";
  className?: string;
}) {
  return <ProductCodeRail entries={ENTRIES} mode={mode} className={className} />;
}
