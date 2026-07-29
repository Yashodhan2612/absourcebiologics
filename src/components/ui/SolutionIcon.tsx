/**
 * Custom 24x24 stroke icon set for the eight solution categories.
 * 2px stroke, rounded caps, drawn specifically for this nav.
 *
 * Section 5 rules out Lucide defaults for these eight: they are the visual
 * signature of the navigation, so they are drawn rather than picked. Each one
 * depicts the physical thing — a set curd in a cup, a strained tub, a cheese
 * wheel with a cut wedge, a pouring vessel, a kulhad, a ghee jar, a colony
 * ring, a bottle.
 */

const PATHS: Record<string, React.ReactNode> = {
  // Set curd in a cup: tapered vessel with a level set line.
  "curd-dahi": (
    <>
      <path d="M5 6h14l-1.6 13.2a1.5 1.5 0 0 1-1.5 1.3H8.1a1.5 1.5 0 0 1-1.5-1.3L5 6Z" />
      <path d="M6.2 11h11.6" />
    </>
  ),
  // Strained tub with a spoon-scooped surface.
  yoghurt: (
    <>
      <path d="M4.5 7h15l-1.2 12.1a1.5 1.5 0 0 1-1.5 1.4H7.2a1.5 1.5 0 0 1-1.5-1.4L4.5 7Z" />
      <path d="M4.5 7c2.4-1.6 12.6-1.6 15 0" />
      <path d="M9 12.5c1.6 1.4 4.4 1.4 6 0" />
    </>
  ),
  // Cheese wheel with a wedge cut out.
  "cheese-paneer": (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 3.8V12l7.6 3.1" />
    </>
  ),
  // Pouring vessel with a stream.
  "buttermilk-lassi": (
    <>
      <path d="M6 5h9v8a4.5 4.5 0 0 1-4.5 4.5h0A4.5 4.5 0 0 1 6 13V5Z" />
      <path d="M15 7.5h1.8a2.2 2.2 0 0 1 0 4.4H15" />
      <path d="M10.5 17.5V21" />
    </>
  ),
  // Kulhad with a domed set.
  "shrikhand-mishti-doi": (
    <>
      <path d="M6.5 9h11l-1 10.2a1.5 1.5 0 0 1-1.5 1.3H9a1.5 1.5 0 0 1-1.5-1.3L6.5 9Z" />
      <path d="M6.5 9c1.4-3.4 9.6-3.4 11 0" />
    </>
  ),
  // Wide-mouth ghee jar with a lid.
  "cultured-ghee-butter": (
    <>
      <path d="M6 9.5h12v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9Z" />
      <path d="M4.8 6.5h14.4v3H4.8z" />
      <path d="M12 13.5v3.5" />
    </>
  ),
  // Colony with a margin ring.
  "probiotics-functional": (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.8v2.6M12 17.6v2.6M3.8 12h2.6M17.6 12h2.6" />
    </>
  ),
  // Cultured beverage bottle.
  "fermented-foods-beverages": (
    <>
      <path d="M10 3h4v3.2l2.2 3.1a4 4 0 0 1 .7 2.3v7a2 2 0 0 1-2 2H9.1a2 2 0 0 1-2-2v-7a4 4 0 0 1 .7-2.3L10 6.2V3Z" />
      <path d="M7.1 14h9.8" />
    </>
  ),
};

export function SolutionIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const path = PATHS[slug];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
