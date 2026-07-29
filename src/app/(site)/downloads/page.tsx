import { Suspense } from "react";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DownloadLibrary } from "@/components/forms/DownloadLibrary";

export const metadata = pageMetadata({
  title: "Data sheets & documentation | ABsource Biologics",
  description:
    "Technical data sheets for the DVS culture range and the current certification pack, for QA and vendor-approval files.",
  path: "/downloads",
});

export default function DownloadsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Downloads", path: "/downloads" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="Documentation"
            title="Data sheets and certification."
            lede="We ask for an email once, so we know who to answer questions from. After that, downloads in this session are open."
          />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
            <DownloadLibrary />
          </Suspense>
        </div>
      </section>
    </>
  );
}
