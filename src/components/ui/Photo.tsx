import Image from "next/image";
import { cn } from "@/lib/cn";
import { Parallax } from "@/components/motion/Parallax";

/**
 * Facility and plant photography, optionally parallaxed.
 *
 * Parallax is applied to photography and nothing else — never to text, never
 * to the header, never beyond +-48px (Section 7A.7). The Parallax wrapper
 * enforces those limits and disables itself at tier 1, so a caller cannot opt
 * into a broken-feeling page by passing a large depth.
 *
 * These are the client's own photographs of the Chinchwad plant. There is no
 * stock photography of people in lab coats anywhere on this site.
 */
export function Photo({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  parallax = false,
  depth = 0.6,
  quality,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  parallax?: boolean;
  depth?: number;
  /** Overrides next/image's default of 75. Worth raising for faces. */
  quality?: number;
}) {
  const image = (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className="object-cover"
    />
  );

  if (!parallax) {
    return <div className={cn("absolute inset-0", className)}>{image}</div>;
  }

  // The positioning stays on a wrapper rather than being handed to Parallax.
  // cn() is a plain joiner, not tailwind-merge, so passing "absolute inset-0"
  // into a component whose base class is "relative" put both position
  // utilities on one element — and Tailwind emits `.relative` after
  // `.absolute`, so `relative` won. The box then had no height of its own and
  // its only child was absolutely positioned, which collapsed every
  // parallaxed photograph on the site to 0px. Measured: the homepage QC-lab
  // photo and all five /why-absource differentiator photos rendered blank.
  return (
    <div className={cn("absolute inset-0", className)}>
      <Parallax className="h-full w-full" depth={depth}>
        {image}
      </Parallax>
    </div>
  );
}
