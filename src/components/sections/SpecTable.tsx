import Link from "next/link";
import { isKnownSpec, type SpecRow } from "@/content/types";

/**
 * Technical specification table — the thing a QA manager actually evaluates.
 *
 * Rows whose value is not confirmed are NOT rendered as data, and are never
 * filled with a plausible-looking guess. They are listed separately as
 * available on the data sheet, which is both truthful and the point at which
 * an evaluating buyer becomes a lead: someone downloading the ABCHEESE TDS is
 * a materially hotter lead than a newsletter signup.
 *
 * If that section looks long right now, that is the honest state of the
 * content, not a design failure. It shortens as CONTENT-TODO.md is worked
 * through — every `todo` string here is a specific question for the client.
 */
export function SpecTable({
  rows,
  downloadHref,
  caption,
}: {
  rows: readonly SpecRow[];
  downloadHref?: string;
  caption?: string;
}) {
  const known = rows.filter(isKnownSpec);
  const outstanding = rows.filter((r) => !isKnownSpec(r));

  return (
    <div className="flex flex-col gap-8">
      {known.length > 0 ? (
        <table className="w-full border-collapse text-left">
          {caption ? (
            <caption className="mono-ab mb-4 text-left text-ab-ink-60">
              {caption}
            </caption>
          ) : null}
          <tbody>
            {known.map((row) => (
              <tr key={row.label} className="border-b border-ab-chill align-top">
                <th
                  scope="row"
                  className="mono-ab w-[45%] py-3.5 pr-6 font-normal text-ab-ink-60 sm:w-[35%]"
                >
                  {row.label}
                </th>
                <td className="py-3.5 text-[0.9375rem] text-ab-ink">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {outstanding.length > 0 ? (
        <div className="border border-ab-chill bg-ab-chill/40 p-6">
          <h3 className="mono-ab mb-4 text-ab-ink">On the data sheet</h3>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {outstanding.map((row) => (
              <li key={row.label} className="text-[0.9375rem] text-ab-ink-60">
                {row.label}
              </li>
            ))}
          </ul>
          <p className="measure-ab mt-5 text-[0.9375rem] leading-[1.55] text-ab-ink-60">
            We publish figures we can stand behind. These are confirmed per batch and
            per application, so they come from the data sheet rather than a web page.
          </p>
          {downloadHref ? (
            <Link
              href={downloadHref}
              className="link-wipe mono-ab mt-5 inline-block text-ab-tank no-underline"
            >
              Request the data sheet &rarr;
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
