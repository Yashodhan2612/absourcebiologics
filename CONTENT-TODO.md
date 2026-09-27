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

- **Logo resolution is capped by the source.** The real lockup now ships in the
  header and footer, built by `npm run prepare-brand`. The largest artwork the
  live site holds is 601x206 (`full` size, with no unscaled original behind
  it), trimmed to 550x179 — enough for about 4x at the sizes the navbar uses,
  so this is not urgent. But **a vector original would be better**: ask the
  client for the AI/EPS/SVG. It would also let the footer knockout keep the
  mark's red arcs, which the raster alpha-channel knockout cannot.

---

## 0b. FERMENTA — added on request, almost nothing known

The client asked for "Fermenta" to be added to the product list. It is now in
`src/content/products.ts` as **FERMENTA** (renamed from ABFERMENTA at the
client's instruction — the product is Fermenta, not ABFermenta), and it is the only SKU on the site
about which we can state essentially nothing.

It does not exist on the live site either — a search of absourcebiologics.com
and its media library returns only the words "fermentation" and "fermented" —
so there was no existing copy to work from and nothing has been inferred.

**Blocking, in priority order:**

1. **Is it a DVS starter culture, a dairy ingredient, or a taste maker?** It is
   currently filed under cultures, because the client wrote "product/strain"
   and because the naming convention is consistent (cultures are AB + an
   end-product or organism word — ABDAHI, ABYOGURT, ABKEFIR; ingredients are
   AB + a function word — ABBIND, ABRENNO, ABMERGE). That choice is published:
   it sets the "DVS starter cultures" label on the card and the detail page.

   Because of this, every *count* on the site now reads **"fourteen culture
   lines"**, not "fourteen DVS culture lines" — on `/products`, `/quality`,
   `/why-absource` and in `stats.cultureLines`. Thirteen of the fourteen
   declare Direct Vat Set on their own page, where it is true; a count is the
   one place a qualifier gets silently applied to a member that has not earned
   it. Put "DVS" back into those four strings once this is confirmed.
2. **What is its strain code?** The other thirteen codes are real identifiers
   printed on the sachet — they are literally the live site's own pack-image
   filenames — so one could not be invented here. Until it arrives FERMENTA
   does not appear in the strain rail or the hero chain motif, both of which
   now track *published codes* rather than culture lines.
3. **Is there pack artwork?** There is none in `public/assets/products/`, so
   the page falls back to the abstract colony plate. The pack-artwork note is
   suppressed on this SKU — it would otherwise describe a colony plate as
   colour-coded packaging.
4. **Which application families does it serve?** `applications` is empty, so it
   appears under no solution page's "What we would trial". An application tag
   is a technical recommendation and was not guessed.
5. **cultureType** — thermophilic, mesophilic, blended or probiotic?
6. **The eight specification rows** — every one ships as a `todo`, so the spec
   table lists them as available on the data sheet and asserts nothing. It uses
   `UNSPECIFIED_COMMON_SPECS`, not `DVS_COMMON_SPECS`, so it does not even
   claim Direct Vat Set, freeze-dried or phage-resistant.
7. **Selector characteristics** — none, so the Culture Selector will never
   recommend it. That is correct until someone can say what it suits.
8. **The summary and description.** They currently say only that it is part of
   the range, which is the only fact the client's message established.

---

## 0c. Product codes — two transcription calls to confirm

The real codes are now on the site, from "Curd variants as per the Taste
profile.xlsx", and the placeholder codes written during the build (CU01, LF01,
YC01, BU01, LB01, CH01, LA01, MD01, SH01, CR01, PB01, KF01, BS01) have been
deleted. A buyer could not tell the two apart, which made them worse than no
code at all.

Two cells needed a judgement call. Both are one-line fixes if wrong:

1. **"AB452Nx"** is published as **AB452NX**. Casing only.
2. **"AB755"** (Mild & thick set) is published as **AB755NX**, because AB755NX
   appears in two other cells and a bare AB755 appears in exactly one. If these
   are genuinely two different codes, say so and the entry splits back in two.

Also outstanding: cell B19 of the spreadsheet reads **"CAN GO AT RT"** under the
Creamy & Rich column. It has not been published anywhere — it reads like a note
about room-temperature stability, but a storage claim is not something to infer
from three words in a spreadsheet. Confirm what it means and where it applies.

**No codes at all were supplied for:** cheese, paneer, buttermilk/chach, lassi,
shrikhand, mishti doi, cultured ghee, kefir, probiotic-functional (beyond the
three curd probiotic codes) or the fermented-beverage lines. Those product
pages therefore show no codes, and the Culture Selector returns the product
line without one. Send the catalogue for those families and they populate with
no code change.

---

## 0d. The four certificate scans expired in 2023

All four are now displayed on /quality and on /why-absource, at a size where a
reader can see the dates. The expiry printed on each scan we hold:

| Certificate | Expiry on the scan |
| --- | --- |
| ISO 9001:2015 | 07 May 2023 |
| ISO 22000:2018 | 24 May 2023 |
| HACCP | 30 June 2023 |
| HALAL | 28 May 2023 |

The site continues to claim all four in the present tense, on the client's own
assertion that certification is current. **That claim and these images now
disagree in public.** Send the renewed scans; each one is a file swap plus one
date in `src/content/certifications.ts` (`scanExpires`). `staleScans()` in that
file returns everything still outstanding.

Two of the files were also mislabelled — `iso-22000.*` contained the HALAL
certificate and `halal.*` contained ISO 22000. Corrected.

The **FSSAI licence is current** (Central Licence 10020022011369, valid to
17 March 2029) and is published in full as a PDF at `/docs/fssai-licence.pdf`.

---

## 0e. The curd footage is illustrative, not the client's product

The "Set curd that holds a clean cut" section plays a six-second loop built
from a generated macro image of set curd taking a spoon cut
(`public/assets/video/curd-scoop.mp4`, poster at
`public/assets/editorial/curd-scoop.*`).

**It is not a photograph of ABsource product and must never be captioned as
one.** It is there because the client asked for scooping footage behind that
statement and no real footage exists. Shoot five seconds of actual product at
the plant and drop it in at the same paths — the markup needs no change.

This replaced a WebGL milk-to-curd simulation, which is why nothing on the site
pins to the scroll any more.

---

## 0f. AB704 and the vegan cultures — featured, but not supplied

The brief asked for AB704, the vegan cultures and FERMENTA to be featured
together. Only FERMENTA shipped: no specification arrived for the other two,
and a featured slot is the worst place to put a name with nothing behind it.

`src/content/featured.ts` has both stubbed out in comments with exactly the
fields they need. Send for each: what it is, which product family, the taste or
functional profile, and the codes. The section heading counts itself, so adding
them needs no other change.

---

## 0g. /why-absource block 4 was briefed as a handshake

No handshake photograph exists in the asset set, and stock imagery of strangers
shaking hands is exactly the padding this site refuses. Block 4 ("End-to-end
partnership") shows two operators working one vessel together instead — real
people from the client's own plant, actually collaborating.

If a handshake is wanted, it needs to be a real photograph of real people at
ABsource. Every one of the five blocks now uses a distinct image used nowhere
else on the site.

---

## 0h. GMP — claimed on the homepage, no certificate held

The "Why we exist" credential strip publishes **"GMP compliance certificate"**
at the client's explicit request. There is no GMP certificate in the asset set,
it is not in `certifications.ts`, and the FSSAI licence does not mention it.

Every other credential on that strip is backed by a document. This one is
published on the client's assertion alone. Get the certificate, add it to
`certifications.ts` alongside the others, and it joins the certificate wall.

Note also that the same strip uses **"State-of-the-Art"**, which Section 13 of
the build brief bans outright. It is the client's own specified wording and
their decision overrides the house style rule — but it is the only banned word
anywhere on the site, so do not "fix" it by reflex.

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
  Measured after the feedback round: `/` = 1, `/export` = 0, every product
  detail page = 0.

  `/about` renders four and `/why-absource` two, over the one-per-domestic-page
  guideline. **Left deliberately.** One of the two on each page is the dated
  2025 Anand RUC milestone, which is a fact about national policy rather than a
  positioning line. The rest are the client's own approved copy — the Promise
  pillars ("Indigenous capability", "'Made in India' is a benchmark"), the
  Promise closing ("a stronger, self-reliant Indian dairy ecosystem") and the
  `ValueTable` "Strategic" row. Editing those is a copy decision for the client,
  not a feedback fix, so they are flagged here rather than rewritten. Say the
  word and they can be softened in one pass over `src/content/company.ts`.
- **`Lorem ipsum`** — the live About page's "Why Choose Us" block is not carried
  over.
- **ABYOGURT copy-paste error** — the live description ends with the ABDAHI
  cup-and-bucket paragraph. Removed.
