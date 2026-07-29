import { valueDelivered, exportStrategicValue } from "@/content/company";

/**
 * The five value types (Section 3A). Shared between /why-absource and /export.
 *
 * The categories map to how a plant justifies a supplier switch internally, so
 * they are kept intact rather than reworded.
 *
 * `audience="export"` swaps the Strategic row for supply reliability and
 * manufacturer-direct terms. The Make-in-India framing is powerful for an
 * Indian buyer and irrelevant to a distributor in Dubai or Dhaka, and it is
 * banned on /export outright (Section 2, Section 13) — so the substitution
 * happens here rather than being left to whoever writes the page.
 */
export function ValueTable({
  audience = "domestic",
}: {
  audience?: "domestic" | "export";
}) {
  const rows =
    audience === "export"
      ? [...valueDelivered.filter((v) => v.id !== "strategic"), exportStrategicValue]
      : valueDelivered;

  return (
    <dl className="border-t border-ab-chill">
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid gap-2 border-b border-ab-chill py-7 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-12"
        >
          <dt className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ab-tank">
            {row.value}
          </dt>
          <dd className="measure-ab text-base leading-[1.6] text-ab-ink-60">
            {row.body}
          </dd>
        </div>
      ))}
    </dl>
  );
}
