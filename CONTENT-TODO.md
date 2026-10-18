# Content to verify before launch

Every item here is something the site currently does **not** claim because it
could not be sourced or confirmed. Nothing in this list is a placeholder
pretending to be real content — where a fact was unavailable, the page omits
it rather than guessing.

Ordered by what blocks launch.

---

## 00. October 2026 catalogue and photography round — open items

Everything the client asked for in this round is done. These are the points
where the instruction ran out, an asset did not arrive, or a judgement call was
made that the client may want to overrule. Most urgent first.

1. **ABMAX has no photograph.** ABBIND was renamed ABMAX "with different
   packaging", and the new pack was not in the files supplied. The old
   photograph prints the old name, so the page and the catalogue card show the
   abstract placeholder rather than a pack that contradicts the heading. Send
   the new pack shot: save it under `public/assets/_source/products/2026/`, add
   a line to `scripts/prepare-media.mjs`, and set `image` on `abmax` in
   `products.ts`.

2. **ABMERGE+ still shows packs printed "ABBINDMAX".** The rename came with no
   mention of new packaging, so the existing photograph was kept. If the pack
   has changed too, send it.

3. **ABVEGAN: image and description still to come** (from Mukesh Kaka, per the
   brief). It is now under a new **Vegan** application filter on `/products`
   and remains in pilot. Its four codes in the master sheet (AB1201, AB1202,
   AB1211, AB1212) are transcribed but **not shown anywhere** while it is in
   pilot: the page says the specification is published at launch.

4. **"Extends the shelf life of chakka by three weeks"** is published on ABSHRI
   (with ABBIO-Shield) on the client's instruction. It is the only quantified
   performance claim on any product page and there is no test data behind it in
   this repository. Keep the supporting data on file.

5. **FERMENTA's photograph has garbled small print — in the source.** The
   sachet image supplied reads "India's Own Dairy Seienee" and "Biologieals for
   Better Batter". It was cleaned up as far as a resample honestly can (cropped
   to the sachet, enlarged 1.7x with a sharpening pass), but the lettering is
   wrong in the file itself and no processing fixes that; a generative upscaler
   would only rewrite it into different nonsense. **The print-ready artwork or
   a photograph of a real sachet is needed.** The reverse of the label, which
   is rendered from the client's own PDF and is correct, is still shown beside
   it.

6. **FERMENTA: two statements that do not obviously agree.** Its specification
   was set to "the exact same as ABDAHI" as instructed. Its own label reverse
   states storage at 2–8°C and a 12-month shelf life; ABDAHI's pack artwork
   prints -18°C and 24 months. Neither figure is typed into a spec table (both
   rows still say "on the data sheet"), so nothing false is published — but
   the two will collide the moment those rows are filled in. Confirm which
   applies to FERMENTA.

7. **ABRENNO sits under the "Cheese & paneer" application.** Every description
   of it now says "Microbial rennet for cheese" and the paneer wording is gone
   from the product, the solution page copy and its FAQ. The application family
   itself is still named "Cheese & paneer", so that chip still appears on the
   ABRENNO page. Splitting the family in two is a navigation change, not a
   wording one; say if it is wanted.

8. **ABMERGE's description was corrected from its own bag.** The 25 kg bag
   declares a single ingredient, glucono-delta-lactone (INS 575), as an acidity
   regulator for paneer. The site used to call it "a functional ingredient
   blend", which the pack contradicts, so it now says what the bag says. The
   bag's line about "softer, creamier and whiter paneer with increased yield"
   is **not** repeated on the site: it is a performance claim with no data
   here.

9. **Certificates now appear once, on /quality.** They used to be repeated in
   the fifth block of /why-absource. Under the rule that no image repeats
   anywhere, that block now shows a photograph of bench testing and links to
   the certificates instead.

10. **Three plant photographs were not used**: the water-treatment shed
    (_MG_0203), the outdoor cold room (_MG_0209) and the open control cabinet
    (_MG_0239). They show exposed wiring, a tin-roofed utility area and
    newspaper-lined walls, which undercut the clean-room claim the rest of the
    set makes. Two more (_MG_0212, _MG_0227) are good but had no slot left;
    each slot uses a different photograph, and there are ten slots.

    In October 2026 the client also sent four retouched plant photographs
    (sachet sealing, fermenter, freeze dryer, two operators at a vessel), which
    replaced the duller originals of the same rooms: the three homepage frames
    and /why-absource block 4. They are 1536px wide, so fewer pixels than the
    1600px crops of the camera originals, but brighter and cleaner; none was
    enlarged. The photograph they replaced in block 4 was the team in a
    meeting. The camera originals of the other three are no longer used
    anywhere.

11. **Pack photographs shared by instruction.** ABDAHI (Probiotic) is shown in
    ABDAHI's pack, ABSHRI (with ABBIO-Shield) in ABSHRI's, and AB704 in
    ABCREAM's, each as asked. The "no photograph repeats" rule is enforced for
    the plant, certificate and portrait photographs; these three are the
    declared exceptions (`packOf` in `products.ts`), and the homepage solution
    tiles are arranged so that no two tiles show the same pack.

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

- **Dr Vinze's portrait** was replaced in October 2026 with the photograph the
  client supplied, which closes the old note about the trade-show snapshot.
  Crops are defined in `scripts/prepare-portraits.mjs`.

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

## 0b. FERMENTA — now described by the client

FERMENTA was added to the range with nothing known about it. The client has
since supplied the description, the application and the specification basis,
and all of it is on the site:

- **Description** (the client's wording): "A Direct Vat Set starter culture for
  idli and dosa batter. Supplied freeze-dried for addition straight to the
  vessel, with no in-house propagation step."
- **Application**: Fermented foods & beverages, and nowhere else.
- **Specification**: the same rows as ABDAHI, as instructed, less the note about
  colour-coded catalogue artwork, which is not true of a product shown in its
  own printed sachet.
- **Variants**: AB1301 and AB1302, from the master sheet.
- Its call to action now reads "Trial FERMENTA on your own batter".

Still open: the quality of the photograph, and a storage-temperature
discrepancy. Both are in §00, items 5 and 6.

---

## 0b-ii. ABVEGAN — new, in pilot

Added as the fifteenth product line, at the client's instruction, with
`availability: "pilot"`. It has a name, a status and a place under the **Vegan**
application filter; no specification, no artwork, and its variant codes are
withheld (§00, item 3).

Every page that would otherwise offer a sample, a data sheet or a comparison to
imported cultures keys off the one `availability` field instead: sample and
data-sheet buttons become "Register your interest", the spec table becomes an
availability note, and the "why this over an imported equivalent" claims are
not rendered. The quote form's product list marks it "in pilot, launching soon".
The Culture Selector cannot suggest it.

When it launches: set `availability` to `"available"` (or delete the field),
add its specification, description and artwork, and give `featured.ts` its
`in-range` status. Its four variants in `variants.ts` become public by
themselves, and adding a "Vegan" entry to `selectorEntries` in
`src/lib/selector.ts` puts it in the selector.

---

## 0b-iii. "200+ cultures" is the client's figure

`stats.culturesOffered`, shown as "200+" in the navigation, the homepage
subhead, `/products`, `/quality`, `/about` and the selector page. It comes from
the client's instruction and is **not derivable from the catalogue**: the
master sheet transcribed in `variants.ts` lists 103 coded cultures. That is a
gap in what has been catalogued, not evidence against the claim, but it is why
the figure is shown as "200+" and never as a precise number, and never typed as
a literal — change it in one place if a firmer number arrives.

The count of *product lines* (fifteen) is separate and is derived from the
catalogue, so it cannot go stale.

---

## 0b-iv. Left as written on purpose

**"India's first indigenous DVS starter culture manufacturer"** (the
positioning claim, the OG image, metadata, /why-absource's title) still says
"DVS starter culture". That is the approved claim about what the company *is*,
not the label of a product category, and rewording an approved dated claim was
not part of this change. The category label, navigation, filters, cards,
headings, counts and stats all moved to "Product lines (DVS starter cultures)".

**Mr. Sonavane's bio still lists BioResource Biotech and BioSphere Life-Sci as
companies he is a founder-director of.** That is a statement about him, not
about ABsource's ownership, so it was kept when the "group company of
BioResource Biotech" claim came out of the About story, the footer, the
structured data and the code. If the affiliation should go too, it is one line
in `src/content/leadership.ts`.

---

## 0c. The variant catalogue — transcription calls to confirm

`src/content/variants.ts` is a transcription of "Master copy of all
variants-updated.xlsx": every coded culture, the client's own description of
it, and the product line it is ordered against. It drives the Culture Selector,
the tabs under it, the "Variants in this line" block on each product page and
the product-code rail. It supersedes the earlier taste-profile sheet, which
covered curd and yoghurt only.

**Cells that needed a judgement call.** Each is a one-line fix if wrong.

1. **"AB77NX"** is published as **AB777NX**. Every other curd code has three
   digits and the earlier sheet lists AB777NX.
2. **AB509** is given in the sheet for both white brine cheese and Camembert.
   It is published as one culture listed for both. One of the two is probably
   a typing slip for a different code.
3. **AB1405, AB1406 and AB1407 are now published.** The first revision of the
   sheet marked them "Not confirmed" (and AB1401, AB1402 and AB1404 "Genomic
   confirm"), so they had been held back. The second revision, of 18 October
   2026, carries no such notes and all nine probiotic strains are live. That
   is the client's sheet changing, not a confirmation we saw: a species name on
   a probiotic is a regulatory statement, so it is worth the team checking the
   strain identities are in fact confirmed before the next customer relies on
   them.
4. **Species names were corrected to current spelling** (casei, bifidum,
   paracasei, delbrueckii subsp. bulgaricus, Lacticaseibacillus). The strain
   designations (ABS01 …) are as written.
5. **The strain-level probiotic and bioprotective cultures** (AB1401–AB1409,
   AB1501–AB1504) are attached to ABDAHI (Probiotic) and ABSHRI (with
   ABBIO-Shield), the renamed successors of ABPROBIO and ABBIO-SHIELD. If they
   should be ordered against something else, change `productSlug` on the two
   families.
6. **Codes in the earlier sheet that are not in the master** were dropped with
   it: AB163NX, AB177NX, AB401NX, AB756NX, AB741SQII, AB757SQII and
   AB779SQII. If any is still sold, it needs adding to the master.
7. **The "which milk leads to which code" table was removed** from the selector
   page. It came from the earlier sheet and disagreed with the master in places
   (it listed AB975NX for full-fat curd; the master makes AB975NX a lassi
   culture). The master states the milk per variant, and that is now the only
   statement of it.

**How the free-text descriptions were read into selector answers.** The sheet
describes each curd variant in a phrase; the selector needs structured values.
The mapping, also in the header of `variants.ts`:

| The sheet says | Read as |
| --- | --- |
| "sharp cut", "clean cut", "firm set" | Texture: firm set, clean cut |
| "highly viscous", "thick" | Texture: thick, high viscosity |
| "spoonable", "creamy" | Texture: creamy, spoonable |
| "diacetyl", "buttery" | Flavour: buttery / diacetyl |
| "tangy" | Flavour: sharp and tangy |
| "mild set", "mild" | Acidity: mild |
| "medium sour" | Acidity: medium |
| "acidic" (buttermilk, lassi, shrikhand) | Acidity: sharp / sour |

Where the sheet says nothing about an attribute the variant is left silent on
it, and the selector gives it no credit there. If a variant is being suggested
too rarely, the fix is to say more about it in the sheet.

**Which questions each product is asked** is set in `selectorEntries` in
`src/lib/selector.ts`. The six curd questions are the client's own. The shorter
lists for the other products were chosen from what their descriptions actually
distinguish on, and the client should confirm them: yoghurt (style, probiotic,
acidity), buttermilk (probiotic, acidity, flavour), lassi (probiotic, acidity),
shrikhand (bioprotective, acidity), cheese and cream (which type). Mishti doi,
kefir, laban, idli/dosa batter and the strain-level probiotic and bioprotective
cultures ask nothing and list their variants.

---

## 0d. Certificates — current, with one date to watch

The four scans were replaced in October 2026 with the certificates issued in
July 2026, which closes the earlier finding that the scans on the site had
expired in 2023. They are shown once, on /quality, and each opens full size.

| Certificate | Issued by | Expiry on the scan |
| --- | --- | --- |
| ISO 9001:2015 | ROHS Certification | 9 July 2029 |
| ISO 22000:2018 | ROHS Certification | 9 July 2029 |
| HACCP | BIMC | 24 July 2027 |
| HALAL | BIMC | 24 July 2027 |

**The HACCP and HALAL certificates need a new scan in July 2027.** They are
numbered valid to 25 July 2029 but print a "Certificate Expiry Date" of
24 July 2027, subject to yearly re-approval, and the earlier date is the one
recorded. `staleScans()` in `src/content/certifications.ts` lists whatever has
passed its date.

The **FSSAI licence is current** (Central Licence 10020022011369, valid to
17 March 2029) and is published in full as a PDF at `/docs/fssai-licence.pdf`.

---

## 0e. The curd photograph is illustrative, not the client's product

The "Set curd that holds a clean cut" section on the homepage shows a single
still: a generated macro image of set curd taking a spoon cut
(`public/assets/editorial/curd-scoop.*`).

**It is not a photograph of ABsource product and must never be captioned as
one.** It is there because the client asked for curd imagery behind that
statement and no real photograph exists. Photograph actual product at the plant
and drop it in at the same path — the markup needs no change.

It is deliberately static. The section was a WebGL simulation, then a
six-second video loop built from this same image; the loop read as the picture
vibrating behind the headline, and the client asked for a still. The video file
has been deleted.

---

## 0f. Featured cultures

The brief asked for AB704, the vegan cultures and FERMENTA to be featured
together, and all three now are (`src/content/featured.ts`). AB704 is a product
in its own right under the new **Gir Cow Ghee** category, with ABCREAM's
photograph and description as instructed, and it is also listed as a variant of
ABCREAM. ABVEGAN is featured as "in pilot".

---

## 0g. /why-absource block 4 was briefed as a handshake

No handshake photograph exists in the asset set, and stock imagery of strangers
shaking hands is exactly the padding this site refuses. Block 4 ("End-to-end
partnership") shows two operators working one vessel together instead — real
people at ABsource, from the photographs supplied in October 2026.

If a handshake is wanted, it needs to be a real photograph of real people at
ABsource. Every one of the five blocks uses a distinct image used nowhere else
on the site.

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
