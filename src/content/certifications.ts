export type Certification = {
  readonly slug: string;
  readonly name: string;
  readonly standard: string;
  readonly what: string;
  readonly image: string;
  /**
   * Expiry printed on the scan we hold, ISO-8601.
   *
   * Recorded so staleness is a fact in the codebase rather than something
   * nobody notices. See `scanIsStale` / `staleScans` below.
   */
  readonly scanExpires: string;
};

/**
 * The four certifications named in the client's brand documents, plus the
 * FSSAI licence.
 *
 * Certificate numbers and issuing bodies are NOT printed as page text. They
 * are on the scans, which is where an auditor will read them; retyping them
 * onto a web page adds a second place for them to go out of date. The FSSAI
 * licence is the exception and is treated separately below, because its number
 * is a public register key a buyer can verify independently.
 *
 * THE SCANS WE HOLD ALL EXPIRED IN 2023. The client asserts current
 * certification and the four names are published on that basis, unchanged —
 * but the image files are old, and they are shown at a size where a reader can
 * see that. Flagged in CONTENT-TODO.md §0d. Dropping in renewed scans and
 * updating one date per row is the whole job.
 *
 * Two of these files were also mislabelled — iso-22000.* held the HALAL
 * certificate and halal.* held ISO 22000. Corrected.
 */
export const certifications: readonly Certification[] = [
  {
    slug: "iso-9001",
    name: "ISO 9001:2015",
    standard: "Quality management systems",
    what: "The manufacturing quality system is documented, audited and repeatable — the basis on which batch-to-batch consistency is claimed.",
    image: "/assets/certs/iso-9001.webp",
    scanExpires: "2023-05-07",
  },
  {
    slug: "iso-22000",
    name: "ISO 22000:2018",
    standard: "Food safety management systems",
    what: "Food safety management across the process, which is the standard a dairy customer's own audit will look for.",
    image: "/assets/certs/iso-22000.webp",
    scanExpires: "2023-05-24",
  },
  {
    slug: "haccp",
    name: "HACCP",
    standard: "Hazard analysis and critical control points",
    what: "Hazards are identified and controlled at defined points in the process rather than inspected for at the end.",
    image: "/assets/certs/haccp.webp",
    scanExpires: "2023-06-30",
  },
  {
    slug: "halal",
    name: "HALAL",
    standard: "Halal certification",
    what: "Required by most Middle Eastern and several South-East Asian importers, and increasingly requested by domestic customers exporting onward.",
    image: "/assets/certs/halal.webp",
    scanExpires: "2023-05-28",
  },
];

/**
 * The FSSAI licence.
 *
 * Every field below is read off the licence itself and is independently
 * checkable on the FSSAI register, which is why the number is published here
 * when certificate numbers are not. It is also the strongest single document
 * on the site: a Central licence carrying Manufacturer AND Exporter scope is
 * the registry's own confirmation of the two claims the site leads with.
 *
 * The PDF is served from public/docs/ rather than through the gated download
 * route. It is a public register document — gating it would be theatre, and
 * an auditor who has to fill in a form to see a licence number assumes the
 * worst.
 */
export const fssai = {
  licenceNumber: "10020022011369",
  category: "Central Licence",
  issuedOn: "2026-07-08",
  validUpto: "2029-03-17",
  /** Verbatim from the licence, condensed to the lines that matter to a buyer. */
  scope: [
    "Manufacturer — General Manufacturing",
    "Manufacturer — Substances Added to Food",
    "Manufacturer — Exporter",
    "Relabeller and Repacker",
    "Trade / Retail — Importer and Exporter",
  ],
  href: "/docs/fssai-licence.pdf",
  what: "A Central licence under the FSS Act 2006, issued to ABsource Biologics Private Limited at the Chinchwad plant. It names manufacturing and export among the licensed activities, which is the registry's own record of what this company does.",
} as const;

/** Formatted for display without pulling in a date library. */
export function formatLicenceDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const index = Number(m) - 1;
  const month = months[index];
  if (!y || !d || !month) return iso;
  return `${Number(d)} ${month} ${y}`;
}

/**
 * Whether the scan we hold has passed the expiry printed on it.
 *
 * The certificates ARE shown — the client asked for them and asserts current
 * certification, and that assertion is theirs to make. This exists so the
 * staleness is a fact in the codebase rather than something nobody notices:
 * it drives the CONTENT-TODO entry and gives whoever refreshes the scans a
 * single predicate to check against.
 *
 * Deliberately NOT used to hide anything at render time. A certificate that
 * silently vanished from the wall would be a worse failure than one that is
 * visibly due for renewal, because nobody would know to fix it.
 */
export function scanIsStale(c: Certification, now: Date = new Date()): boolean {
  return new Date(c.scanExpires) <= now;
}

/** Every certificate whose scan needs refreshing. Empty is the goal. */
export function staleScans(now: Date = new Date()): readonly Certification[] {
  return certifications.filter((c) => scanIsStale(c, now));
}

/** Quality attributes stated in the brand documents. No numbers beyond these. */
export const qualityClaims = [
  {
    title: "24 quality checks",
    body: "Every batch is released against 24 quality checks covering bacterial concentration and purity.",
  },
  {
    title: "Freeze-dried, phage-resistant strains",
    body: "Phage attack is the failure mode that costs a plant a full vat. The strains are selected for resistance and supplied freeze-dried.",
  },
  {
    title: "Clean-room manufacturing",
    body: "Production runs in certified clean-room conditions, with an in-process QC lab on site.",
  },
] as const;
