# Third-party assets and licences

## Fonts

All fonts are **self-hosted**. The site makes no external font CDN calls.

### Currently shipping

| Face | Role | Source | Licence |
|---|---|---|---|
| Inter Variable | Body | [`@fontsource-variable/inter`](https://www.npmjs.com/package/@fontsource-variable/inter) | SIL Open Font License 1.1 |
| Inter Tight Variable | Display | [`@fontsource-variable/inter-tight`](https://www.npmjs.com/package/@fontsource-variable/inter-tight) | SIL Open Font License 1.1 |
| JetBrains Mono Variable | Utility / data | [`@fontsource-variable/jetbrains-mono`](https://www.npmjs.com/package/@fontsource-variable/jetbrains-mono) | SIL Open Font License 1.1 |

The `.woff2` files are committed to `src/fonts/` and loaded via
`next/font/local`. All three are OFL-1.1, which permits commercial use and
embedding.

### Intended, not yet shipped

The design brief specifies **Clash Display** (display) and **Switzer** (body),
both from [Fontshare](https://www.fontshare.com/). Neither could be downloaded
in the build environment. What ships instead is the brief's own nominated
fallback stack.

**Before swapping them in:** verify the current Fontshare licence terms and
record them in this file. See `src/fonts/index.ts` for the swap procedure —
it touches one file.

## Imagery

### Generated in-repo

`src/components/ui/ColonyPlate.tsx` generates decorative imagery as inline SVG
— deterministic agar-plate colony morphology, seeded per product or page, drawn
only in the brand palette. **No third-party licence applies.**

`src/components/ui/SolutionIcon.tsx` is an original 24×24 stroke icon set drawn
for the eight solution categories. No icon library is used.

`public/assets/webgl/culture-field-poster.avif` is generated at build time by
`scripts/generate-posters.mjs`, which runs the same Gray-Scott system as the
hero shader on the CPU. Original output; no third-party licence applies.

**Shader code is original.** The Gray-Scott implementation
(`webgl/shaders/grayScott.ts`) follows the standard published formulation of
the model, which is mathematics rather than a licensable work. The 3D gradient
noise in `webgl/shaders/milkToCurd.ts` was written for this repo specifically
so that no third-party shader licence — Ashima's simplex noise being the usual
one — needs tracking here.

### ABsource's own photography

Brand, facility, leadership, product-pack and certification imagery belongs to
ABsource Biologics and is fetched from the live site by
`scripts/fetch-assets.sh`, which has been run. Only the optimised AVIF/WebP
outputs are committed; originals stay in the gitignored
`public/assets/_source/`.

**No stock photography is used anywhere on this site.** There is no image of a
person in a lab coat pointing at a clipboard, and no AI-generated photography
of laboratories, people or product.

Two images on the live site are **deliberately excluded** from that script:

```
2024/11/health-care-researchers-working-life-science-laboratory-work-test-vaccine-1024x683.jpg
2024/11/image-two-young-business-partners-talking-office-1024x684.jpg
```

Both have Freepik-pattern filenames, indicating licensed stock whose licence
status could not be confirmed. Do not add them without checking the licence.

### If application photography is sourced later

Unsplash and Pexels both permit commercial use without attribution. **Record
the source URL of every image in this file anyway**, so provenance is traceable
if a licence is ever questioned.

| Image | Used on | Source URL | Licence |
|---|---|---|---|
| _(none yet)_ | | | |

## Software

Next.js, React, Tailwind CSS, Zod, Vitest, sharp and Playwright — all MIT or
Apache-2.0. Resend and Upstash SDKs are MIT and are optional at runtime.

The motion and 3D layer, all lazily loaded and none of it in the initial
bundle: three.js (MIT), @react-three/fiber (MIT), @react-three/drei (MIT),
lenis (MIT), detect-gpu (MIT), and GSAP with ScrollTrigger. **GSAP's licence
needs checking before launch** — the standard GSAP core and ScrollTrigger are
free for commercial use under GreenSock's "no charge" licence, but that licence
has specific conditions and has changed terms before. Confirm the current terms
for a commercial marketing site and record the outcome here.
