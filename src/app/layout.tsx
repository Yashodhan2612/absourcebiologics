import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://absourcebiologics.com"),
  title: {
    default: "ABsource Biologics — DVS dairy starter cultures, made in India",
    template: "%s | ABsource Biologics",
  },
  description:
    "India's first indigenous DVS starter culture manufacturer. Direct Vat Set cultures developed and manufactured in Pune, formulated for Indian dairy.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B3B3C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is on <html> for exactly one reason: the inline
    // script below adds a `js` class to this element before React hydrates, so
    // the server markup and the client DOM legitimately differ by that one
    // class. Without it, every page logs a hydration error and any real
    // mismatch is lost in the noise. It covers this element's attributes only,
    // not its subtree.
    <html lang="en-IN" className={fontVariables} suppressHydrationWarning>
      <head>
        {/*
          Marks the document as JS-capable before first paint. Scroll reveals
          and the sticky-header shadow are scoped to `html.js`, so with JS off
          or still loading the page renders fully visible rather than blank.
          Inline and synchronous by necessity — it must run before CSS applies.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
