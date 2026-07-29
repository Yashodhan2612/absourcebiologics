# ABsource Biologics — absourcebiologics.com

Corporate site for ABsource Biologics Pvt. Ltd., a Pune-based manufacturer of
DVS (Direct Vat Set) dairy starter cultures, dairy ingredients and taste makers.

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · deployed on Vercel.

**Read [`CONTENT-TODO.md`](./CONTENT-TODO.md) before launch.** It lists every
fact the site deliberately does not claim yet, and why.

---

## Local development

```bash
corepack enable            # the repo pins pnpm
pnpm install
pnpm dev                   # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest — selector engine unit tests |
| `pnpm fetch-assets` | Download real imagery from the live site (needs network access) |
| `pnpm optimise-assets` | Convert fetched images to AVIF + WebP at 1x/2x |
| `node scripts/check-contrast.mjs` | Verify every palette pair against WCAG 2.2 AA |
| `node scripts/shoot.mjs <label> <path>` | Screenshot a route at 390/768/1440 |

`TIER1=1 node scripts/shoot.mjs ...` forces reduced-motion, which the app
treats as render tier 1 — the "honesty check" that the page still looks
finished with all motion disabled.

---

## Environment variables

**Every one of these is optional.** The app builds and runs without any of
them; each missing service degrades rather than breaking.

| Variable | Used for | Without it |
|---|---|---|
| `RESEND_API_KEY` | Lead + autoresponder email | Leads are logged to the console as structured records. Nothing is lost. |
| `SALES_INBOX` | Domestic lead destination | Falls back to `info@absourcebiologics.com` |
| `EXPORT_INBOX` | Export lead destination | Falls back to `SALES_INBOX` |
| `LEAD_FROM` | From address | Falls back to `noreply@absourcebiologics.com` |
| `UPSTASH_REDIS_REST_URL` / `..._TOKEN` | Rate limiting (5/hour/IP) | Falls back to an in-process counter — weaker (per-instance, resets on cold start) but better than none |
| `DOWNLOAD_SECRET` | Signing gated-document tokens | A per-boot random secret is used; tokens simply expire on restart. Never fails open. |

Set `DOWNLOAD_SECRET` in production, or every deploy invalidates outstanding
download links.

---

## How the content layer works

There is no CMS and no database. Everything the site renders lives in typed
TypeScript under `src/content/` and is maintained through git.

The type system carries the editorial rules, so a claims problem is a build
error rather than something to catch in review:

- **`SpecRow`** is `{ label, value }` **or** `{ label, todo }`. There is no
  third state and no default, so an unknown incubation temperature cannot reach
  a page as a guess. `SpecTable` renders `todo` rows as "on the data sheet".
- **`StatEntry`** carries `verified`. `<Stat>` returns `null` for anything
  unverified, so the tile is omitted entirely — this is the structural fix for
  the old site rendering `0 +` for Years / Countries / Customers.
- **`ValueTable`** takes an `audience` prop that swaps the Make-in-India row for
  supply reliability on `/export`, where self-reliance framing is banned.

### Adding a product

1. Add an entry to the `products` array in `src/content/products.ts`.
2. Give it a `category` (`cultures` | `ingredients` | `taste-makers`), a `slug`,
   and — for cultures — a `strainCode`.
3. Tag it with `applications` from the eight `ApplicationTag` values. This alone
   makes it appear on the matching solution pages and in the catalogue filters.
4. For a culture, add a `selectorProfile`. **An empty array on an axis means
   "not applicable", never "matches everything"** — that is what stops the
   engine manufacturing a false match.
5. Put the pack image at `public/assets/products/<category>/<slug>.jpg` and
   point `image` at it.

The detail page, sitemap entry, `StrainIndex` rail and JSON-LD all follow
automatically. **Run `pnpm test`** — the engine tests assert every culture with
a profile is still reachable as a top match, so a bad profile fails the build.

### Adding a solution page

Add an entry to `src/content/solutions.ts`. The `slug` must be one of the eight
`ApplicationTag` values (add to the union in `types.ts` first if you need a
ninth). Recommended SKUs are pulled by tag, not hand-listed. Also add an icon
to `src/components/ui/SolutionIcon.tsx` — these eight are drawn rather than
picked from a library, deliberately.

### Adding a data sheet (TDS)

1. Put the PDF in **`private/docs/`** — outside `public/`, never directly
   reachable by URL.
2. Add an entry to `src/content/downloads.ts` with `file` set to the **bare
   filename** (no path separators — the API route rejects them).
3. Set `productSlug` so the product page links to it and the lead notification
   names the document.

The route validates the email, records the lead, then issues a signed
single-use token valid for 15 minutes. A declared document with no PDF present
returns a clear "not published yet, we've recorded your request" rather than a
500 — so you can declare documents ahead of having them.

### Changing a stat

`src/content/stats.ts` only. Never hardcode a number in a component. Anything
`verified: false` will not render, and the build prints a warning listing them.

---

## Architecture notes worth knowing before editing

**Motion is progressive enhancement, not a dependency.** Scroll reveals hide
content via CSS scoped to `html.js`, set by an inline script in the root
layout. With JavaScript unavailable the page renders fully visible. The whole
rule sits inside `@media (prefers-reduced-motion: no-preference)`, so reduced
motion means there is nothing for JavaScript to disable.

**The `StrainIndex` ticker animation is pure CSS**, also inside a
no-preference block. Same reasoning.

**The mega menu distinguishes pointer from keyboard.** Hover opens after 120ms;
Enter/Space opens *and* traps focus. Trapping a hover-opened panel would fight
a pointer user who never asked to be in it. Escape always closes and returns
focus to the trigger.

**Catalogue filters are links, not state.** Filter state lives in the URL, so a
filtered view is shareable and indexable and the page stays a server component.

**The selector engine is pure** (`src/lib/selector-engine.ts`) — no side
effects, fully unit tested. `making` is a **gate, not a weight**: a product that
does not serve what the buyer is making is disqualified outright. Without that,
a product can fail the axis that matters most and still clear the confidence
threshold on minor axes — which is how a curd culture got recommended for
paneer. That case is a permanent regression test; do not weaken it.

An empty result is a **designed outcome**, not an error. Below `MIN_CONFIDENCE`
the wizard says so and routes to a human rather than returning a near-miss.

---

## Deployment

Vercel, connected to the repository. `pnpm build` is the build command; no
`vercel.json` is needed.

**Before the DNS cutover**, confirm the legacy redirects work. All eleven are
in `next.config.ts` as permanent (301) redirects — the old WordPress URLs are
indexed and must not 404:

```
/ab-about-us · /management · /ab-products · /ab-dairy-ingredients
/ab-taste-maker · /ab-our-clientele · /events-exhibitions · /exhibitions
/ab-careers · /ab-contact-us · /Curd-Discovery.html
```

---

## The motion and WebGL layer

Everything 3D sits behind `src/lib/render-tier.ts`, which is the only place
that decides whether a canvas is allowed to exist. Read it before touching
anything in `src/components/webgl/`.

| Tier | When | What renders |
|---|---|---|
| 3 | GPU tier >= 2, 4GB+, 4g, WebGL2, >=1024px, no reduced-motion | every moment, 512² simulation, DPR <= 1.75 |
| 2 | WebGL2 present but any tier-3 condition fails | hero culture field only, 256², no pinning, flat pack shots |
| 1 | reduced-motion, save-data, 2G/3G, GPU tier 0, no WebGL2, or the chunk fails | zero WebGL, posters only, no parallax, no Lenis |

### Debugging it on a real device

```
?tier=1        force static — this is the honesty check, run it before shipping
?tier=2        force reduced
?tier=3        force full
?debug=perf    frame-rate and tier readout, left in the production build
```

`?debug=perf` costs a few hundred bytes inside a chunk that only loads at
tier 2+, and it is the only way to diagnose framerate on a buyer's actual
phone in a plant office. Do not strip it.

### The moments

- **Hero culture field** (`webgl/CultureField.tsx`) — a Gray-Scott
  reaction-diffusion simulation seeded with thirteen colonies, one per DVS
  culture line. Two things about it are load-bearing and easy to break:
  the render targets must be `FloatType`, not `HalfFloatType` (half float
  cannot resolve a ~1e-4 increment against a value near 1.0, and the reaction
  silently freezes into thirteen inert rings); and feed/kill are sensitive to
  the third decimal place. Run `node scripts/generate-posters.mjs --explore`
  and look at the contact sheet before changing either.
- **Milk to curd** (`sections/MilkToCurdSection.tsx`) — the site's only pinned
  section, and the pinning budget is two. It pins for exactly 100vh, never
  below 768px, never at tier 1.
- **The sachet** (`webgl/Sachet.tsx`) — one procedural pillow-pouch model with
  a texture swap per SKU. Culture SKUs only: the ingredient and taste maker
  packs are stand-up pouches, and wrapping their artwork onto a sachet would
  misrepresent what the buyer receives.
- **The strain field** (brief §7A.5) — not built. It was the explicitly
  cuttable one, and `/products` already has a strong filterable catalogue.

### The pinning rule that is not optional

ScrollTrigger's `pin` wraps its target in a `.pin-spacer` div and moves the
target inside it. Two consequences, and getting either wrong crashes every
route change with **"Application error: a client-side exception has occurred"**
and `Failed to execute 'removeChild' on 'Node'`:

1. **Pin an inner wrapper, never a node React renders as a subtree root.** If
   you pin the `<section>` React put into `<main>`, GSAP moves it out of
   `<main>`, and React's `main.removeChild(section)` on navigation throws.
   Pinning a child keeps the reparenting inside the section, where React only
   ever removes the top host node.
2. **Set GSAP up and tear it down in a layout effect**, via
   `components/motion/useIsomorphicLayoutEffect.ts` — never plain `useEffect`.
   React runs layout-effect cleanups before it removes host nodes, and defers
   passive cleanups until after. A passive cleanup un-wraps the spacer too
   late to help.

`scripts/verify-navigation.mjs` guards both.

### Verifying a change

```bash
npm run build                              # let it finish; do not pipe it
npm start -- -p 3310                       # NOT while `next dev` is running

node scripts/verify-navigation.mjs         # every route + every legacy 301
node scripts/verify-webgl.mjs              # tier 3: canvas sizes, CLS, captures
TIER=1 node scripts/verify-webgl.mjs       # the honesty check
BASE=http://localhost:3310 TIER1=1 node scripts/shoot.mjs tier1 / /products
```

Two traps worth knowing, because both produce the same "client-side exception"
symptom as a real bug and send you hunting for one that is not there:

- `next dev` and `next start` share `.next`. Running one while the other is
  live, or rebuilding under a running server, leaves the browser asking for
  chunk hashes that no longer exist. Stop the server, `rm -rf .next`, rebuild.
- A `next start` that failed to bind (EADDRINUSE) leaves the *previous* server
  answering on that port from a `.next` that has since been overwritten. Check
  with `lsof -nP -iTCP:<port> -sTCP:LISTEN` rather than trusting `pkill`.

Measured on this build: initial JS 123KB gzipped (budget 130), lazy 3D layer
170KB gzipped (budget 240), CLS 0.0037 (budget 0.05), no three.js in the
initial bundle.

---

## Known gaps

- **Application photography for the eight solution pages.** See
  `CONTENT-TODO.md` §0 — not sourced, and deliberately not faked.
- **`clients.ts` is empty.** The downloaded logo filenames do not reliably
  identify customers. See `CONTENT-TODO.md` §0.
- **Tier-2 fallback for the milk-to-curd moment** departs from brief §7A.4,
  which asks for a 40-frame AVIF sequence. That needs renders of set curd
  which do not exist in the asset set. Documented in the component.
- **Lighthouse and axe have not been run** against a deployed URL.
