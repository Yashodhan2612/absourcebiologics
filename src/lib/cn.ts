/**
 * Minimal class-name joiner. Deliberately not clsx/tailwind-merge — the app
 * has no conflicting-variant problem and this keeps the initial bundle small
 * (Section 7A.8: initial JS <= 130KB gzipped).
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
