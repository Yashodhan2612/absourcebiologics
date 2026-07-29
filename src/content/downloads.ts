/**
 * The gated document library.
 *
 * Files live in private/docs/ — OUTSIDE public/, so they are never directly
 * reachable by URL. /api/download validates the request, records the lead and
 * streams the file behind a short-lived signed token (Section 10).
 *
 * `file` is a filename only, never a path. The API route resolves it against
 * private/docs/ and rejects anything containing a separator, so a crafted
 * `file` value cannot traverse out of the directory.
 *
 * NO PDFs ARE COMMITTED. Each entry below is declared because the product
 * exists and a buyer will ask for its data sheet; the route returns a clear
 * "not yet available" rather than a 500 when the file is absent. Drop the real
 * PDF into private/docs/ using the exact `file` name and it goes live with no
 * code change.
 */

export type DownloadDoc = {
  readonly slug: string;
  readonly title: string;
  readonly kind: "tds" | "certificate" | "brochure";
  /** Bare filename inside private/docs/. No path separators permitted. */
  readonly file: string;
  /** Product slug this document belongs to, for lead scoring. */
  readonly productSlug?: string;
  readonly description: string;
};

export const downloads: readonly DownloadDoc[] = [
  {
    slug: "abdahi-tds",
    title: "ABDAHI (CU01) — technical data sheet",
    kind: "tds",
    file: "abdahi-cu01-tds.pdf",
    productSlug: "abdahi",
    description: "Composition, incubation parameters, dosage and storage for set curd and dahi.",
  },
  {
    slug: "abyogurt-tds",
    title: "ABYOGURT (YC01) — technical data sheet",
    kind: "tds",
    file: "abyogurt-yc01-tds.pdf",
    productSlug: "abyogurt",
    description: "Composition, incubation parameters, dosage and storage across the yoghurt range.",
  },
  {
    slug: "abcheese-tds",
    title: "ABCHEESE (CH01) — technical data sheet",
    kind: "tds",
    file: "abcheese-ch01-tds.pdf",
    productSlug: "abcheese",
    description: "Composition, incubation parameters and dosage for the cheese range.",
  },
  {
    slug: "certifications-pack",
    title: "Certification pack — ISO 9001, ISO 22000, HACCP, HALAL",
    kind: "certificate",
    file: "absource-certifications.pdf",
    description: "Current certificates, for audit and vendor-approval files.",
  },
];

export function downloadBySlug(slug: string): DownloadDoc | undefined {
  return downloads.find((d) => d.slug === slug);
}

/** Documents a buyer would download for a given product. */
export function downloadsForProduct(productSlug: string): readonly DownloadDoc[] {
  return downloads.filter((d) => d.productSlug === productSlug);
}
