import { Suspense } from "react";
import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DownloadLibrary } from "@/components/forms/DownloadLibrary";

export const metadata = pageMetadata({
  title: "Data sheets & documentation",
  description:
    "Technical data sheets for our product lines (DVS starter cultures) and the current certification pack, for QA and vendor-approval files.",
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
            lede="Data sheets carry composition, dosage and incubation parameters, so we confirm the dairy before we send one. Tell us who you are and a technologist emails it across."
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
