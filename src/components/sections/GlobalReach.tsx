import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { globalReach, vision } from "@/content/company";

/**
 * The market, widened — homepage only.
 *
 * Added at the client's request: the homepage was framed entirely on Indian
 * dairy, and they asked for the global market and the company's international
 * vision to sit alongside it.
 *
 * Its own component rather than a reuse of ClientWall, which is shared with
 * /customers and would have dragged this copy onto a page it does not belong
 * on.
 *
 * Two things here are deliberate and easy to undo by accident:
 *
 *  - NO NUMBER. stats.countriesServed is flagged unverified — "5+" reads small
 *    beside "300+ customers" and CONTENT-TODO says explicitly not to inflate
 *    it. The international claim is made on what ABsource does, not on a
 *    figure nobody has confirmed. Do not add a country count here to make the
 *    section feel more concrete.
 *  - The link is text-ab-tank, never text-ab-ghee. This section sits on
 *    ab-white, and ab-ghee fails 4.5:1 on a light ground. (ab-ghee-dark is the
 *    light-ground substitute, but the page's ghee budget is already spent on
 *    the two buttons.)
 *
 * `vision` is rendered verbatim from the existing const, matching /about, so
 * the ambition is worded identically in both places.
 */
export function GlobalReach() {
  return (
    <section className="section-ab-tight bg-ab-white">
      <div className="container-ab">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <Eyebrow className="mb-5">{globalReach.eyebrow}</Eyebrow>
            <h2 className="text-[2rem] leading-[1.02] tracking-[-0.03em] text-ab-ink md:text-[2.75rem]">
              {globalReach.title}
            </h2>
          </div>

          <div className="flex flex-col justify-center">
            <div className="measure-ab flex flex-col gap-5">
              {globalReach.body.map((para) => (
                <p key={para} className="text-base leading-[1.65] text-ab-ink-60">
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-10 border-t border-ab-chill pt-8">
              <Eyebrow className="mb-4">Vision</Eyebrow>
              <p className="measure-ab text-[1.5rem] leading-[1.2] tracking-[-0.02em] text-ab-tank md:text-[1.75rem]">
                {vision.body}
              </p>
            </div>

            <Link
              href="/export"
              className="link-wipe mono-ab mt-8 inline-block text-ab-tank no-underline"
            >
              How export supply works &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
