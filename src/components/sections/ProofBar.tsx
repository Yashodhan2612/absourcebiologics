/**
 * Four proof points in monospace. No icons — the type does the work
 * (Section 8, homepage section 3).
 */
const PROOF = [
  "Est. 2014",
  "ISO 9001 · ISO 22000 · HACCP · HALAL",
  "3–5 day delivery",
  "Pune, India",
] as const;

export function ProofBar() {
  return (
    <section className="border-b border-ab-chill bg-ab-white" aria-label="Company credentials">
      <div className="container-ab">
        <ul className="grid grid-cols-1 divide-y divide-ab-chill sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {PROOF.map((item) => (
            <li
              key={item}
              className="mono-ab py-5 text-ab-ink-60 sm:border-r sm:border-ab-chill sm:px-6 sm:first:pl-0 sm:last:border-r-0"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
