import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StrainCode } from "@/components/ui/StrainCode";
import { Chip, ChipStatic } from "@/components/ui/Chip";
import { Stat } from "@/components/ui/Stat";
import { CardLink, CardMedia, CardBody } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { TextField, SelectField } from "@/components/ui/Field";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { stats } from "@/content/stats";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const COLOURS = [
  ["ab-ink", "#0C1413", "Body text"],
  ["ab-ink-60", "#4A5654", "Secondary copy"],
  ["ab-tank", "#0B3B3C", "Primary brand"],
  ["ab-tank-600", "#135052", "Brand, lifted"],
  ["ab-tank-300", "#7FA9A9", "Reversed secondary"],
  ["ab-chill", "#DCE7E7", "Cool surface tint"],
  ["ab-milk", "#FBFAF7", "Page background"],
  ["ab-white", "#FFFFFF", "Card surface"],
  ["ab-ghee", "#E4A33B", "Accent — fills only, max 2/viewport"],
  ["ab-ghee-dark", "#986615", "Accent TEXT + focus ring"],
  ["ab-culture", "#6FBF6B", "Live/active states only"],
  ["ab-alert", "#C0442E", "Errors"],
] as const;

const TYPE_SCALE = [
  ["7.5rem", "120px", "text-[7.5rem]"],
  ["5.25rem", "84px", "text-[5.25rem]"],
  ["3.75rem", "60px", "text-[3.75rem]"],
  ["2.75rem", "44px", "text-[2.75rem]"],
  ["2rem", "32px", "text-[2rem]"],
  ["1.5rem", "24px", "text-[1.5rem]"],
  ["1.25rem", "20px", "text-[1.25rem]"],
  ["1.0625rem", "17px — body base", "text-[1.0625rem]"],
  ["1rem", "16px", "text-[1rem]"],
  ["0.875rem", "14px", "text-[0.875rem]"],
  ["0.75rem", "12px — mono utility", "text-[0.75rem]"],
] as const;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ab-chill py-16">
      <Eyebrow className="mb-8">{title}</Eyebrow>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="container-ab py-24">
      <SectionHeading
        as="h1"
        eyebrow="Internal · not indexed"
        title="ABsource design system"
        lede="Every token, type step and component state in one place. If something on the site is not built from these, it is a bug."
      />

      <Block title="Colour">
        <div className="grid grid-cols-2 gap-px border border-ab-chill bg-ab-chill sm:grid-cols-3 lg:grid-cols-4">
          {COLOURS.map(([name, hex, use]) => (
            <div key={name} className="bg-ab-white p-4">
              <div
                className="mb-3 h-20 w-full border border-ab-ink/10"
                style={{ backgroundColor: hex }}
              />
              <p className="mono-ab text-ab-ink">{name}</p>
              <p className="mono-ab text-ab-ink-60">{hex}</p>
              <p className="mt-2 text-[0.875rem] text-ab-ink-60">{use}</p>
            </div>
          ))}
        </div>
        <p className="measure-ab mt-6 text-[0.875rem] text-ab-ink-60">
          ab-ghee-dark was darkened from the brief&rsquo;s #B87D22 to #986615. The original
          measured 3.36:1 on ab-milk, which clears large text and focus rings but fails the
          4.5:1 body-text requirement. Same hue and saturation, L reduced to 34%. Run{" "}
          <code className="mono-ab">node scripts/check-contrast.mjs</code> to re-verify.
        </p>
      </Block>

      <Block title="Type scale">
        <div className="flex flex-col gap-6">
          {TYPE_SCALE.map(([rem, px, cls]) => (
            <div key={rem} className="flex items-baseline gap-6 border-b border-ab-chill pb-4">
              <span className="mono-ab w-40 shrink-0 text-ab-ink-60">
                {rem} · {px}
              </span>
              <span
                className={`font-display leading-[0.95] tracking-[-0.03em] ${cls} truncate`}
              >
                Set curd
              </span>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Families">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="mono-ab mb-3 text-ab-ink-60">Display</p>
            <p className="font-display text-[2.75rem] leading-[0.95] tracking-[-0.03em]">
              Direct Vat Set
            </p>
          </div>
          <div>
            <p className="mono-ab mb-3 text-ab-ink-60">Body</p>
            <p className="text-base">
              Freeze-dried, phage-resistant cultures with a guaranteed bacterial
              concentration, verified through 24 quality checks.
            </p>
          </div>
          <div>
            <p className="mono-ab mb-3 text-ab-ink-60">Utility / data</p>
            <p className="mono-ab">CU01 · 42&deg;C · 6&ndash;8 H · 0.75% LA</p>
          </div>
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Request a sample</Button>
          <Button variant="secondary">Download the data sheet</Button>
          <Button variant="quiet">Find your culture</Button>
          <Button variant="primary" disabled>
            Sending
          </Button>
          <ButtonLink href="/styleguide" variant="primary" size="lg">
            Large primary
          </ButtonLink>
        </div>
        <div className="ab-reversed mt-6 bg-ab-tank p-8">
          <Button variant="reversed">Talk to a technologist</Button>
        </div>
      </Block>

      <Block title="Strain codes">
        <div className="flex flex-wrap items-center gap-3">
          <StrainCode code="CU01" />
          <StrainCode code="YC01" />
          <StrainCode code="MD01" tone="muted" />
        </div>
        <div className="ab-reversed mt-4 flex gap-3 bg-ab-tank p-6">
          <StrainCode code="CH01" tone="reversed" />
          <StrainCode code="PB01" tone="reversed" />
        </div>
      </Block>

      <Block title="Chips">
        <div className="flex flex-wrap gap-3">
          <Chip active>Cheese &amp; paneer</Chip>
          <Chip>Curd &amp; dahi</Chip>
          <Chip>Thermophilic</Chip>
          <ChipStatic>ABDAHI · CU01</ChipStatic>
        </div>
      </Block>

      <Block title="Stats">
        <p className="measure-ab mb-6 text-[0.875rem] text-ab-ink-60">
          Only verified entries render. countriesServed and flavourPortfolio are marked
          unverified and are deliberately absent below &mdash; the tile is omitted, never
          zeroed.
        </p>
        <div className="flex flex-wrap gap-16">
          <Stat entry={stats.customersServed} label="Customers served" />
          <Stat entry={stats.cultureLines} label="DVS culture lines" />
          <Stat entry={stats.qualityChecks} label="Quality checks" />
          <Stat entry={stats.countriesServed} label="Countries (should not render)" />
          <Stat entry={stats.flavourPortfolio} label="Flavours (should not render)" />
        </div>
      </Block>

      <Block title="Cards">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {["Curd & dahi", "Cheese & paneer", "Buttermilk & lassi"].map((t) => (
            <CardLink key={t} href="/styleguide">
              <CardMedia>
                <div className="flex h-full w-full items-center justify-center bg-ab-chill">
                  <span className="mono-ab text-ab-ink-60">Application photo</span>
                </div>
              </CardMedia>
              <CardBody>
                <h3 className="text-[1.5rem]">{t}</h3>
                <p className="mt-2 text-[0.9375rem] text-ab-ink-60">
                  A one-line outcome the buyer actually wants.
                </p>
                <p className="mt-4 text-[0.9375rem] text-ab-tank">See cultures &rarr;</p>
              </CardBody>
            </CardLink>
          ))}
        </div>
      </Block>

      <Block title="Accordion">
        <Accordion
          items={[
            { q: "What incubation temperature does a thermophilic blend need?", a: <p>Typically 42&deg;C. Confirm your plant can hold it before switching.</p> },
            { q: "How is dosage specified?", a: <p>Per 100 litres of milk, adjusted for fat and target acidity.</p> },
          ]}
        />
      </Block>

      <Block title="Form controls">
        <div className="grid max-w-2xl gap-6">
          <TextField label="Work email" required placeholder="you@dairy.co.in" />
          <TextField
            label="Work email"
            required
            defaultValue="not-an-email"
            error="Enter a work email so we can send the data sheet."
          />
          <SelectField
            label="What are you making?"
            required
            placeholder="Select a product"
            options={[
              { value: "curd", label: "Curd / dahi" },
              { value: "cheese", label: "Cheese" },
            ]}
          />
          <TextField label="Anything else we should know" multiline hint="Volumes, timeline, current supplier." />
        </div>
      </Block>

      <Block title="Reversed section">
        <div className="ab-reversed bg-ab-tank p-10">
          <SectionHeading
            tone="reversed"
            eyebrow="Reversed"
            title="We are not traders; we are manufacturers and innovators."
            lede="ab-milk text on ab-tank measures 11.80:1."
          />
        </div>
      </Block>
    </main>
  );
}
