import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Editorial card. Square corners — cards and images carry no radius at all;
 * this is a manufacturing company, not a consumer app (Section 6, Layout).
 * No shadows. Hover lifts 2px and scales the image 1.02 (Section 6, Motion).
 */
export function CardLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "group block border border-ab-chill bg-ab-white no-underline",
        "transition-[transform,border-color] duration-150 ease-ab",
        "hover:-translate-y-0.5 hover:border-ab-tank",
        "motion-reduce:hover:translate-y-0",
        className
      )}
    >
      {children}
    </Link>
  );
}

/** Image well for a CardLink. Fixed aspect prevents layout shift (CLS < 0.05). */
export function CardMedia({
  className,
  children,
  aspect = "4/3",
}: {
  className?: string;
  children: React.ReactNode;
  aspect?: string;
}) {
  return (
    <div
      className={cn("relative w-full overflow-hidden bg-ab-chill", className)}
      style={{ aspectRatio: aspect }}
    >
      <div className="absolute inset-0 transition-transform duration-150 ease-ab group-hover:scale-[1.02] motion-reduce:group-hover:scale-100">
        {children}
      </div>
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
