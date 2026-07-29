import type { Metadata } from "next";
import { company, positioning } from "@/content/company";
import type { Product } from "@/content/types";

export const SITE_URL = "https://absourcebiologics.com";

/**
 * Metadata helper. Titles are capped at 60 characters and descriptions at 155
 * so they are not truncated in results — enforced by assertion in development
 * rather than trusted (Section 11).
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  if (process.env.NODE_ENV !== "production") {
    if (title.length > 60) {
      console.warn(`[seo] Title over 60 chars (${title.length}): "${title}"`);
    }
    if (description.length > 155) {
      console.warn(
        `[seo] Description over 155 chars (${description.length}) for ${path}`
      );
    }
  }

  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: company.shortName,
      locale: "en_IN",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** JSON-LD emitted once site-wide from the (site) layout. */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: company.legalName,
        alternateName: company.shortName,
        url: SITE_URL,
        description: positioning.claim,
        foundingDate: String(company.foundedYear),
        parentOrganization: { "@type": "Organization", name: company.group },
        address: {
          "@type": "PostalAddress",
          streetAddress: `${company.address.line1}, ${company.address.line2}`,
          addressLocality: company.address.city,
          postalCode: company.address.postcode,
          addressCountry: "IN",
        },
        email: company.email,
        telephone: company.phones,
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#localbusiness`,
        name: company.legalName,
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        address: {
          "@type": "PostalAddress",
          streetAddress: `${company.address.line1}, ${company.address.line2}`,
          addressLocality: company.address.city,
          postalCode: company.address.postcode,
          addressCountry: "IN",
        },
        email: company.email,
        telephone: company.phones[0],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Product structured data.
 *
 * Deliberately omits `offers`, `aggregateRating` and `review` — there is no
 * price, no rating and no review to report, and inventing any of them would be
 * both a fabricated claim and a structured-data policy violation.
 */
export function ProductJsonLd({ product }: { product: Product }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.strainCode ?? product.slug,
    description: product.description,
    category: product.category,
    brand: { "@type": "Brand", name: company.shortName },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  trail,
}: {
  trail: ReadonlyArray<{ name: string; path: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FaqJsonLd({
  faqs,
}: {
  faqs: ReadonlyArray<{ q: string; a: string }>;
}) {
  if (faqs.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
