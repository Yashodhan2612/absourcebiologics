import { pageMetadata, BreadcrumbJsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { CTABand } from "@/components/sections/CTABand";
import { team, teamIntro } from "@/content/team";

export const metadata = pageMetadata({
  title: "The team",
  description:
    "The department heads behind the cultures — research and quality control, quality assurance, production, final packaging, sales, HR and accounts.",
  path: "/team",
});

/**
 * The team.
 *
 * Separate from /about/leadership, which is the two founders with their
 * photographs and long biographies. This page is the department heads: the
 * people a customer actually deals with once an account is live.
 *
 * NO PORTRAITS. None were supplied. Rather than leave holes, or fill them with
 * stock photographs of people who do not work here, each person gets a
 * typographic card built from their initials — which is a deliberate treatment
 * in the site's own type system, not a broken image. `src/content/team.ts`
 * documents how to add real photographs when they arrive; the grid takes them
 * without a redesign.
 */
export default function TeamPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "The team", path: "/team" },
        ]}
      />

      <section className="border-b border-ab-chill">
        <div className="container-ab py-20 md:py-28">
          <SectionHeading
            as="h1"
            eyebrow={teamIntro.eyebrow}
            title={teamIntro.title}
            lede={teamIntro.body[0]}
          />
          <p className="measure-ab mt-6 text-base leading-[1.65] text-ab-ink-60">
            {teamIntro.body[1]}
          </p>
        </div>
      </section>

      <section className="section-ab-tight">
        <div className="container-ab">
          <ul className="grid gap-px border border-ab-chill bg-ab-chill md:grid-cols-2 lg:grid-cols-3">
            {team.map((person) => (
              <li key={person.slug} className="flex flex-col bg-ab-white p-8">
                {/*
                  Initials, not an avatar. A monogram in the display face is
                  part of the type system; a grey silhouette is a missing
                  photograph with a shape drawn over it.
                */}
                <span
                  aria-hidden="true"
                  className="font-display flex h-16 w-16 shrink-0 items-center justify-center border border-ab-tank/20 text-[1.375rem] tracking-[-0.02em] text-ab-tank"
                >
                  {initials(person.name)}
                </span>

                <h2 className="mt-6 font-display text-[1.5rem] leading-[1.15] tracking-[-0.02em] text-ab-ink">
                  {person.name}
                </h2>

                <p className="mono-ab mt-2 text-ab-tank">{person.department}</p>
                <p className="mono-ab text-[0.8125rem] text-ab-ink-60">
                  {person.designation}
                </p>

                <p className="mt-5 text-[0.9375rem] leading-[1.65] text-ab-ink-60">
                  {person.bio}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-14">
            <Eyebrow className="mb-4">Also</Eyebrow>
            <p className="measure-ab text-base leading-[1.65] text-ab-ink-60">
              The company was founded by a scientist and a biotechnologist, who
              still run it.{" "}
              <a href="/about/leadership" className="link-wipe text-ab-tank no-underline">
                Meet the founders
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <CTABand
        title="Talk to the person who does the work."
        body="Technical questions reach a technologist here, not a call centre. Tell us what you are making and who you need to speak to."
        cta="Send us your spec"
        secondaryHref="/contact"
        secondaryCta="Contact the plant"
      />
    </>
  );
}

/**
 * Two letters from the name, skipping the honorific.
 *
 * "Ms. Manisha Bhadekar" -> MB, not "MM". Falls back to the first two letters
 * of a single-word name so this can never render empty.
 */
function initials(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((p) => !/^(mr|ms|mrs|dr)\.?$/i.test(p))
    .filter(Boolean);

  const first = parts[0] ?? name;
  const last = parts.length > 1 ? parts[parts.length - 1] : undefined;

  if (last) return (first.charAt(0) + last.charAt(0)).toUpperCase();
  return first.slice(0, 2).toUpperCase();
}
