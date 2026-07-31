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

  return (
    <Parallax className={cn("absolute inset-0", className)} depth={depth}>
      {image}
    </Parallax>
  );
}
