import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "reversed" | "quiet";
type Size = "md" | "lg";

/**
 * Buttons name the outcome ("Request a sample", "Download the data sheet").
 * Never "Submit", never "Learn more", never "Click here" — Section 13.
 *
 * 4px radius is the only radius in the system and applies here and to form
 * controls. No shadows, no gradients.
 */
const VARIANTS: Record<Variant, string> = {
  // The one ghee-filled element. ab-ink on ab-ghee measures 8.53:1.
  primary:
    "bg-ab-ghee text-ab-ink border border-ab-ghee hover:bg-ab-ghee-dark hover:text-ab-milk hover:border-ab-ghee-dark",
  secondary:
    "bg-transparent text-ab-ink border border-ab-ink/25 hover:border-ab-ink hover:bg-ab-ink hover:text-ab-milk",
  reversed:
    "bg-transparent text-ab-milk border border-ab-milk/30 hover:bg-ab-milk hover:text-ab-tank hover:border-ab-milk",
  quiet:
    "bg-ab-white text-ab-ink border border-ab-chill hover:border-ab-ink",
};

const SIZES: Record<Size, string> = {
  md: "px-5 py-2.5 text-[0.9375rem]",
  lg: "px-7 py-3.5 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-ab font-medium " +
  "transition-colors duration-150 ease-ab no-underline text-center " +
  "disabled:opacity-50 disabled:pointer-events-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
