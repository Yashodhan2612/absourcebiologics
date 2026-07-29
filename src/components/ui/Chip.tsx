import Link from "next/link";
import { cn } from "@/lib/cn";

const BASE =
  "inline-flex items-center gap-1.5 rounded-ab border px-3 py-1.5 text-[0.875rem] " +
  "transition-colors duration-150 ease-ab no-underline";

/**
 * `active` uses ab-culture, which is reserved for live/active states only —
 * selected filters, in-stock badges, the selector's match indicator. It is
 * never a decorative accent (Section 6, Palette).
 */
function chipTone(active: boolean): string {
  return active
    ? "border-ab-culture bg-ab-culture/12 text-ab-ink"
    : "border-ab-chill bg-ab-white text-ab-ink-60 hover:border-ab-ink hover:text-ab-ink";
}

export function ChipLink({
  href,
  active = false,
  className,
  children,
  ...rest
}: {
  href: string;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(BASE, chipTone(active), className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Chip({
  active = false,
  className,
  children,
  ...rest
}: {
  active?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(BASE, chipTone(active), className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Non-interactive label, e.g. the selected SKU carried through a form. */
export function ChipStatic({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn(BASE, "border-ab-chill bg-ab-chill/50 text-ab-ink", className)}>
      {children}
    </span>
  );
}
