# Content to verify before launch

Every item here is something the site currently does **not** claim because it
could not be sourced or confirmed. Nothing in this list is a placeholder
pretending to be real content — where a fact was unavailable, the page omits
it rather than guessing.

Ordered by what blocks launch.

---

## 0. Assets — fetched, wired, and what is still missing

`scripts/fetch-assets.sh` has now been run successfully. 91 of 93 files
downloaded from the live site, were optimised to AVIF + WebP, and are wired
into the pages. `<ColonyPlate>` is no longer standing in for photography
anywhere except where it is the deliberate choice (see below).

To regenerate from scratch on a new machine:

```bash
bash scripts/fetch-assets.sh   # ~93 files from the live WordPress site
npm run optimise-assets        # AVIF + WebP
npm run gen-posters            # the tier-1 hero poster
```

Note: only the optimised `.webp` / `.avif` outputs are committed. The
originals live in `public/assets/_source/`, which is gitignored — the raw
sachet JPEGs are ~1.9MB each against a 36KB WebP, and committing 37MB of
near-lossless source alongside the optimised set is not worth it. Re-run the
fetch script if you need them back.

### Still outstanding

- **Application photography for the eight solution pages.** Not sourced. The
  brief asks for Indian dairy contexts from Unsplash or Pexels and explicitly
  rejects anything reading as Western supermarket yoghurt; those libraries
  return curries and pizza for "paneer", which would cheapen the page in front
  of the technical buyer it is written for. Solution **cards** therefore show
  the real pack of the lead culture for that application, and solution
  **heroes** use the abstract colony plate. If the client supplies real
  application photography, add an `image` field to `solutions.ts` and prefer
  it in `SolutionMedia` (`src/components/ui/PackShot.tsx`).

- **`src/content/clients.ts` is still an empty array, deliberately.** 58 logo
  files downloaded, but the filenames do not reliably identify customers:
  `rajhans.webp` is not Rajhans (it is an unrelated red emblem), and
  `AZIMUT.webp` is Gruppo Azimut, an Italian asset manager, which is plainly
  not a dairy customer. These look like leftover WordPress uploads. Publishing
  them as customers would be a false claim on the page where ABsource is
  asking to be trusted. **Ask the client for a confirmed logo set** and
  populate the array then. Until then the wall renders nothing and the "300+
  customers" caption carries the point on its own.

- **`public/assets/facility/plant-02`** is a phone selfie of the team at an
  event. It is real, but it does not hold up at the sizes the design uses and
  it is off-key against the clean-room photography. Left unused; consider it
  for `/careers` if the client wants it there.

- **Dr Vinze's portrait is a phone photograph.** At the client's request the
  seated studio portrait (DSC00586) was replaced with the standing shot from
  AgriTech / DairyTech India 2022, which is the only solo standing photograph
  of him in the site's media library. It is noticeably softer than the studio
  shot it replaced, and the two founders' portraits no longer match in style —
  one is a studio desk portrait, the other a trade-show snapshot. **Worth
  asking whether a standing studio portrait exists**, or commissioning one;
  matching portraits would lift the page. Crops are defined in
  `scripts/prepare-portraits.mjs`.

- **Palette reconciliation.** Section 5 asks for the logo's hex values to be
  sampled and the tokens adjusted. `brand/logo.webp` is now available — sample
  it, adjust `src/app/globals.css`, and re-run `node scripts/check-contrast.mjs`.

- **Logo.** `src/components/layout/Logo.tsx` still renders a typographic
  wordmark rather than the real mark, which is now at
  `public/assets/brand/logo.webp`. Header and Footer both read from it.

---

## 1. Blocking: product technical data

**Every technical figure on all 21 SKUs is unconfirmed and therefore unpublished.**
`src/content/products.ts` marks each as a `todo` row, and `SpecTable` renders
them as "on the data sheet" instead of inventing values.

Needed per SKU (`DVS_COMMON_SPECS` in `src/content/products.ts`):

- Organism composition (species / genera present)
- Incubation temperature range (°C)
- Incubation time to target acidity
- Recommended dosage (units per 100 L)
- Target acidity (% lactic acid / pH)
- Packaging sizes
- Storage conditions and shelf life

Same for the 7 ingredients and the taste maker (`INGREDIENT_COMMON_SPECS`),
plus declared composition and E-numbers where applicable.

**Process parameters** on all 8 solution pages
(`PROCESS_TODO` in `src/content/solutions.ts`) are equally unconfirmed.

**Product descriptions.** Phase 2 of the brief asks for the live site's own
descriptions as the copy base. The site was unreachable, so descriptions were
written from the product name and application family only — deliberately
conservative, with no performance claims. **Review all 21.** The ingredients
(ABBIND, ABBINDMAX, ABPRO, ABHIPRO, ABRENNO, ABMERGE, ABBLEND) and ABSPICE are
the least certain, since their function is inferred from the name.

**`cultureType` classification** (thermophilic / mesophilic / blended /
probiotic) drives catalogue filtering and the selector. It was assigned from
the application family using standard dairy microbiology, not from ABsource
data. Confirm all 13.

---

## 2. Blocking: statistics

In `src/content/stats.ts`. Anything marked `verified: false` does not render
anywhere — the tile is omitted rather than showing a zero.

- **`countriesServed` (5+) — currently unverified, does not render.**
  "More than 5 countries" reads small beside "300+ customers" and undercuts
  `/export`. Either supply the real current count, or drop the stat entirely
  and let `/export` list named markets. **Do not inflate it.**
- **`flavourPortfolio` (8000+) — currently unverified, does not render.**
  The live Taste Maker page claims 8000+ flavours. Confirm this is ABsource's
  own range and not a sourcing partner's catalogue.
- **`customersServed` (300+) — currently published.** Confirm it is still
  accurate.

---

## 3. Leadership bios

In `src/content/leadership.ts`.

- **Tenure is omitted entirely.** The live bios say "ABsource Biologics –
  5 Years" for both founders against a 2014 founding. That is stale, and an
  export buyer doing diligence will do the arithmetic. Supply correct figures
  rather than having them silently rewritten.
- **Employer name corrections, applied but marked `pendingVerification`:**
  - "Cadillac pharma" → **Cadila Pharmaceuticals**
  - "Biological Evans" → **Biological E**
  Confirm both. They were corrected rather than reproduced because publishing
  the originals would itself damage credibility.
- Confirm the full previous-employer lists and qualifications.

---

## 4. Tagline — decision needed

"Transforming Dairy, Naturally!" is not used anywhere. The exclamation mark and
the vagueness both undercut a technical sale. Three replacements are in
`taglineOptions` in `src/content/company.ts`:

1. *Cultures made in India, for Indian dairy.*
2. *Direct Vat Set cultures, developed and manufactured in Pune.*
3. *The starter culture, made here.*

Pick one, or reject all three.

---

## 5. Empty by design — add content when it exists

None of these are bugs. Each renders an honest empty state.

- **`src/content/news.ts`** — empty. The live Events & Exhibitions page could
  not be read. `/news` says so and invites the reader to ask.
- **Case studies** — `caseStudies` in `src/app/(site)/customers/page.tsx` is
  empty. The `CaseStudy` component is built and typed. **Do not publish a case
  study without the customer's approval of the named result.**
- **Job vacancies** — `openRoles` in `src/app/(site)/careers/page.tsx` is empty.
  The open application form works regardless.
- **`private/docs/`** — no PDFs committed. The four documents declared in
  `src/content/downloads.ts` return a clear "not published yet, we've recorded
  your request" rather than a 500. Drop real PDFs in using the exact `file`
  names and they go live with no code change.

---

## 6. Decisions still open

- **Fonts.** Clash Display and Switzer (Fontshare) could not be downloaded. The
  brief's own nominated fallback stack — Inter Tight / Inter / JetBrains Mono —
  is self-hosted in their place. `src/fonts/index.ts` documents the four-step
  swap-in. **Verify the Fontshare licence and record it in `CREDITS.md`** before
  shipping the intended faces.
- **CV upload.** `CareersForm` asks candidates to email their CV rather than
  shipping a file input. Accepting uploads needs a blob store *and* a retention
  policy for personal data; an input that accepts a CV and drops it would be
  worse than none. Decide where CVs should live.
- **Legal pages.** `src/content/legal.ts` describes accurately what the site
  collects and makes no compliance claims. **Have a lawyer review both before
  launch** — DPDP Act obligations in particular are not addressed.
- **Certificate details.** `/quality` deliberately publishes no certificate
  numbers, issuing bodies or expiry dates, because none were supplied and an
  auditor wants the certificate itself. Confirm this is the intended handling.
- **Analytics.** `src/lib/analytics.ts` is a seam with no provider wired up. No
  consent banner ships because nothing sets a non-essential cookie. Adding GA4
  changes that — revisit consent at the same time.

---

## 7. Claims that are deliberately absent

Recorded so nobody "helpfully" adds them back.

- **"First *and only*"** — the "only" half appears nowhere in the codebase and
  must not be reintroduced. A national Ready-to-Use Culture plant opened at
  Anand in July 2025, so a second indigenous manufacturer exists and a
  government body publicly claims the "first plant" title. Publishing "only"
  invites a buyer to produce a ministerial press release contradicting it, on
  the exact page where ABsource asks to be trusted on quality claims. The
  defensible framing — first, dated, verifiable — is in
  `positioning.claimLong`.
  Verify with: `grep -ri "first and only\|only indian" src/` → must return nothing.
- **Named competitors** — no comparative or critical mention of any culture
  manufacturer or industry body. Comparisons are to "imported cultures"
  generically.
- **Self-reliance language on `/export` and product pages** — banned outright
  there. `ValueTable` enforces it structurally via the `audience` prop.
- **`Lorem ipsum`** — the live About page's "Why Choose Us" block is not carried
  over.
- **ABYOGURT copy-paste error** — the live description ends with the ABDAHI
  cup-and-bucket paragraph. Removed.
