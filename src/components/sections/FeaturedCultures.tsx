import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredCultures, featuredIntro, featuredTitle } from "@/content/featured";

/**
 * Cultures pulled out of the catalogue and given their own billing.
 *
 * Laid out so one card reads as deliberate rather than as two that failed to
 * load: a single entry takes a wide two-column card with the copy beside the
 * label, and two or three fall into an even grid. The section removes itself
 * entirely when nothing is featured, so an empty `featuredCultures` can never
 * ship a heading with nothing under it.
 */
export function FeaturedCultures() {
  if (featuredCultures.length === 0) return null;

  const single = featuredCultures.length === 1;

  /**
   * Columns follow the card count. A fixed three-column grid with two cards
   * leaves an empty cell, and in a hairline grid the container background
   * paints it — a large grey panel that reads as a loading failure. The team
   * page had the same defect with seven people in three columns.
   */
  const columns =
    featuredCultures.length === 2
      ? "md:grid-cols-2"
      : featuredCultures.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="section-ab-tight border-t border-ab-chill">
      <div className="container-ab">
        <SectionHeading
          eyebrow={featuredIntro.eyebrow}
          title={featuredTitle(featuredCultures.length)}
          lede={featuredIntro.lede}
          className="mb-12 max-w-3xl"
        />

        <ul
          className={
            single
              ? "grid gap-px border border-ab-chill bg-ab-chill"
              : `grid gap-px border border-ab-chill bg-ab-chill ${columns}`
          }
        >
          {featuredCultures.map((item) => (
            <li key={item.slug} className="bg-ab-white">
              <Link
                href={item.href}
                className={
                  single
                    ? "group grid h-full gap-6 p-8 no-underline md:grid-cols-[minmax(0,18rem)_1fr] md:gap-12 md:p-10"
                    : "group flex h-full flex-col gap-4 p-8 no-underline"
                }
              >
                <div>
                  <p className="mono-ab text-ab-ink-60">{item.kicker}</p>
                  <h3 className="mt-3 font-display text-[2rem] leading-[1] tracking-[-0.03em] text-ab-ink group-hover:text-ab-tank md:text-[2.5rem]">
                    {item.name}
                  </h3>
                </div>

                <div className="flex flex-col">
                  <p className="text-[1.0625rem] leading-[1.5] text-ab-ink">
                    {item.summary}
                  </p>
                  <p className="measure-ab mt-4 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                    {item.body}
                  </p>
                  <span className="link-wipe mono-ab mt-6 inline-block w-fit text-ab-tank">
                    {item.status === "pilot"
                      ? "Register your interest →"
                      : item.status === "spec-on-request"
                        ? "Request the specification →"
                        : "See the specification →"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
