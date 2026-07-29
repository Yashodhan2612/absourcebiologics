import localFont from "next/font/local";

/**
 * Self-hosted faces. No external font CDN calls anywhere in the app.
 *
 * SUBSTITUTION NOTE — read before changing anything here.
 * The design brief specifies Clash Display (display) and Switzer (body) from
 * Fontshare. Those files are not in this repo and could not be fetched during
 * the build (see CONTENT-TODO.md). What ships instead is the brief's own
 * nominated fallback stack — Inter Tight for display, Inter for body — served
 * as self-hosted variable woff2 from src/fonts/.
 *
 * To drop the intended faces in later:
 *   1. Download Clash Display (500, 600) and Switzer (400, 500) from Fontshare.
 *   2. Put the woff2 files in src/fonts/.
 *   3. Repoint `display` and `body` below at them.
 *   4. Re-run scripts/check-contrast.mjs — nothing else in the app changes,
 *      because every consumer reads --font-display / --font-body.
 * The `adjustFontFallback`/`fallback` metrics below exist to keep CLS < 0.05
 * while the face swaps in.
 */

export const displayFont = localFont({
  src: [
    {
      path: "./inter-tight-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-ab-display",
  display: "swap",
  fallback: ["Inter Tight", "ui-sans-serif", "system-ui", "sans-serif"],
  preload: true,
});

export const bodyFont = localFont({
  src: [
    {
      path: "./inter-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-ab-body",
  display: "swap",
  fallback: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  preload: true,
});

export const monoFont = localFont({
  src: [
    {
      path: "./jetbrains-mono-latin-wght-normal.woff2",
      weight: "100 800",
      style: "normal",
    },
  ],
  variable: "--font-ab-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
  preload: false,
});

export const fontVariables = [
  displayFont.variable,
  bodyFont.variable,
  monoFont.variable,
].join(" ");
