import Link from "next/link";
import { PackShot } from "@/components/ui/PackShot";
import { StrainCode } from "@/components/ui/StrainCode";
import { cultures } from "@/content/products";

/**
 * Horizontal rail of the thirteen culture sachets, each showing its strain
 * code (Section 8, homepage section 8).
 *
 * Scroll-snapped and keyboard-navigable: each card is a link, so Tab walks the
 * rail and the browser scrolls the focused card into view natively. No custom
 * key handling and no arrow buttons that only work with a pointer.
 *
 * The pack images are not available in this environment, so each card carries
 * a seeded colony plate in their place (see CONTENT-TODO.md). Swapping in the
 * real photography means replacing one <ColonyPlate> with <Image>.
 */
export function ProductRail() {
  return (
    <div
      className="flex snap-x snap-mandatory gap-px overflow-x-auto border-y border-ab-chill bg-ab-chill pb-px"
      // A scrollable region needs to be reachable and announced.
      tabIndex={0}
      role="region"
      aria-label="DVS starter culture range"
    >
      {cultures.map((product) => (
        <Link
          key={product.slug}
          href={`/products/cultures/${product.slug}`}
          className="group w-[70vw] shrink-0 snap-start bg-ab-white no-underline sm:w-[38vw] lg:w-[22rem]"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <div className="absolute inset-0 transition-transform duration-150 ease-ab group-hover:scale-[1.02] motion-reduce:group-hover:scale-100">
              <PackShot
                src={product.image}
                alt={`${product.name} pack`}
                seed={product.strainCode ?? product.slug}
                sizes="(min-width: 1024px) 22rem, 70vw"
              />
            </div>
            <div className="absolute left-4 top-4">
              {product.strainCode ? <StrainCode code={product.strainCode} /> : null}
            </div>
          </div>
          <div className="flex flex-col gap-2 p-5">
            <h3 className="text-[1.25rem] text-ab-ink">{product.name}</h3>
            <p className="text-[0.875rem] leading-[1.5] text-ab-ink-60">
              {product.summary}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
