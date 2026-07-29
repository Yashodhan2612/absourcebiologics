import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SolutionList } from "@/components/sections/SolutionGrid";
import { CTABand } from "@/components/sections/CTABand";

export const metadata = pageMetadata({
  title: "Dairy culture solutions by application | ABsource",
  description:
    "Eight application families: curd and dahi, yoghurt, cheese and paneer, buttermilk and lassi, shrikhand, cultured ghee, probiotics and fermented beverages.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow="Solutions"
            title="Start from what you are making."
            lede="Each page carries the technical challenge, the cultures we would trial, and the process parameters your QA team will want."
          />
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <SolutionList />
        </div>
      </section>

      <CTABand
        title="Making something that isn't on this list?"
        body="Custom culture development starts from your product spec rather than from a catalogue page."
        href="/services/custom-culture-development"
        cta="Describe what you're trying to make"
      />
    </>
  );
}
