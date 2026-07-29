import Image from "next/image";
import { cn } from "@/lib/cn";
import { ColonyPlate } from "@/components/ui/ColonyPlate";
import { products, productsByApplication } from "@/content/products";

/**
 * A product's real pack photography.
 *
 * The packs are shot against white with a lot of headroom, so they are
 * `object-contain` on a faint ab-chill ground rather than cropped to fill —
 * cropping a sachet cuts the strain code off the artwork, which is the one
 * thing on the pack a buyer is looking for.
 *
 * Falls back to a seeded ColonyPlate if an image is genuinely missing, so a
 * new SKU added without artwork degrades to the abstract plate rather than to
 * a broken image.
 */
export function PackShot({
  src,
  alt,
  seed,
  className,
  sizes = "(min-width: 1024px) 22rem, 50vw",
  priority = false,
}: {
  src?: string | undefined;
  alt: string;
  seed: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return <ColonyPlate seed={seed} density={70} className={className} />;
  }

  return (
    <div className={cn("absolute inset-0 bg-ab-chill/35", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-contain p-4"
      />
    </div>
  );
}

/** Pack shot resolved from a product slug. */
export function ProductPackShot({
  slug,
  className,
  sizes,
  priority,
}: {
  slug: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  // Slugs are unique across categories, so the category is not needed here.
  const product = products.find((p) => p.slug === slug);
  return (
    <PackShot
      src={product?.image}
      alt={product ? `${product.name} pack` : ""}
      seed={slug}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}

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
 */
export function SolutionMedia({
  slug,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: {
  slug: string;
  className?: string;
  sizes?: string;
}) {
  const lead = productsByApplication(slug)[0];
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
