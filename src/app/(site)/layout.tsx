import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { warnUnverifiedStats } from "@/content/stats";
import { OrganizationJsonLd } from "@/lib/seo";

// Build-time warning listing every stat still marked unverified, so they
// cannot be quietly forgotten before launch (Section 3).
warnUnverifiedStats();

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SkipLink />
      {/* Renders nothing. Disables itself at tier 1 and on touch. */}
      <SmoothScroll />
      <OrganizationJsonLd />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
