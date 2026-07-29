export type Certification = {
  readonly slug: string;
  readonly name: string;
  readonly standard: string;
  readonly what: string;
  readonly image: string;
};

/**
 * The four certifications named in the client's brand documents. Nothing is
 * added here that the client has not stated it holds.
 *
 * Certificate numbers, issuing bodies and expiry dates are NOT recorded — they
 * were not supplied, and an auditor will ask for the certificate itself rather
 * than trust a number typed onto a web page. /quality routes that request to a
 * human instead.
 */
export const certifications: readonly Certification[] = [
  {
    slug: "iso-9001",
    name: "ISO 9001:2015",
    standard: "Quality management systems",
    what: "The manufacturing quality system is documented, audited and repeatable — the basis on which batch-to-batch consistency is claimed.",
    image: "/assets/certs/iso-9001.webp",
  },
  {
    slug: "iso-22000",
    name: "ISO 22000:2018",
    standard: "Food safety management systems",
    what: "Food safety management across the process, which is the standard a dairy customer's own audit will look for.",
    image: "/assets/certs/iso-22000.webp",
  },
  {
    slug: "haccp",
    name: "HACCP",
    standard: "Hazard analysis and critical control points",
    what: "Hazards are identified and controlled at defined points in the process rather than inspected for at the end.",
    image: "/assets/certs/haccp.webp",
  },
  {
    slug: "halal",
    name: "HALAL",
    standard: "Halal certification",
    what: "Required by most Middle Eastern and several South-East Asian importers, and increasingly requested by domestic customers exporting onward.",
    image: "/assets/certs/halal.webp",
  },
];

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
