import type { NextConfig } from "next";

/**
 * Legacy URL map — the WordPress site has indexed pages and every one of these
 * must 301 rather than 404. Section 11.
 */
const LEGACY_REDIRECTS: ReadonlyArray<{ source: string; destination: string }> = [
  { source: "/ab-about-us", destination: "/about" },
  { source: "/management", destination: "/about/leadership" },
  { source: "/ab-products", destination: "/products?category=cultures" },
  { source: "/ab-dairy-ingredients", destination: "/products?category=ingredients" },
  { source: "/ab-taste-maker", destination: "/products?category=taste-makers" },
  { source: "/ab-our-clientele", destination: "/customers" },
  { source: "/events-exhibitions", destination: "/news" },
  { source: "/exhibitions", destination: "/news" },
  { source: "/ab-careers", destination: "/careers" },
  { source: "/ab-contact-us", destination: "/contact" },
  { source: "/Curd-Discovery.html", destination: "/culture-selector" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 768, 1024, 1280, 1600, 1920],
  },

  eslint: {
    dirs: ["src"],
  },

  async redirects() {
    // statusCode: 301 rather than `permanent: true`. Next's `permanent` flag
    // emits 308, which Google treats identically, but several SEO audit tools
    // and older crawlers still expect a literal 301 on a WordPress migration.
    // These URLs are indexed, so match the spec exactly rather than rely on
    // equivalence.
    return LEGACY_REDIRECTS.map((r) => ({ ...r, statusCode: 301 as const }));
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
