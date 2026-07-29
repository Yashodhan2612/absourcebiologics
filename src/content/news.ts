/**
 * News, events and exhibitions.
 *
 * DELIBERATELY EMPTY. The live site's Events & Exhibitions page was
 * unreachable from the build environment (see CONTENT-TODO.md), and inventing
 * an event ABsource did not attend would be a fabricated claim.
 *
 * /news renders an honest empty state rather than placeholder entries. Add
 * real entries here and the index and detail routes pick them up.
 */

export type NewsItem = {
  readonly slug: string;
  readonly title: string;
  readonly date: string; // ISO 8601
  readonly kind: "event" | "exhibition" | "article";
  readonly summary: string;
  readonly body: readonly string[];
  readonly location?: string;
};

export const news: readonly NewsItem[] = [];

export function newsBySlug(slug: string): NewsItem | undefined {
  return news.find((n) => n.slug === slug);
}
