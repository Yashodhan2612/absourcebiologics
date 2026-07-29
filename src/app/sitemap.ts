import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { products } from "@/content/products";
import { solutions } from "@/content/solutions";
import { services } from "@/content/services";
import { news } from "@/content/news";
import { legalPages } from "@/content/legal";

/**
 * Generated from the content files, so adding a product or a solution page
 * puts it in the sitemap automatically and the two cannot drift apart.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1 },
    { path: "/solutions", priority: 0.9 },
    { path: "/products", priority: 0.9 },
    { path: "/culture-selector", priority: 0.9 },
    { path: "/why-absource", priority: 0.8 },
    { path: "/quality", priority: 0.8 },
    { path: "/export", priority: 0.8 },
    { path: "/services", priority: 0.7 },
    { path: "/about", priority: 0.7 },
    { path: "/about/leadership", priority: 0.6 },
    { path: "/customers", priority: 0.6 },
    { path: "/downloads", priority: 0.6 },
    { path: "/news", priority: 0.5 },
    { path: "/careers", priority: 0.5 },
    { path: "/contact", priority: 0.7 },
    { path: "/request-a-quote", priority: 0.8 },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...solutions.map((s) => ({
      url: `${SITE_URL}/solutions/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/products/${p.category}/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...services.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...news.map((n) => ({
      url: `${SITE_URL}/news/${n.slug}`,
      lastModified: new Date(n.date),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    // Legal pages are noindex; included so they are discoverable but low priority.
    ...legalPages.map((p) => ({
      url: `${SITE_URL}/legal/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.1,
    })),
  ];
}
