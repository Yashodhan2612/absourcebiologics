"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { codeIndex } from "@/content/cultures";

/**
 * The product code rail — the site's signature element (Section 7).
 *
 * The code system is a genuine artifact of the business, not decoration, so it
 * is used as a structural device: a horizontal monospace rail of every code,
 * like a register on a lab wall.
 *
 * It now renders the client's OWN codes from their taste-profile catalogue
 * (src/content/cultures.ts) rather than the CU01/YC01 placeholders written
 * during the build, and it is labelled "Product code" rather than "Strain
 * index" — the client's term, and previously two names for one thing.
 *
 * Each code links to the product line it is ordered against, because a code is
 * a sub-category of a product: AB436NX is a way of buying ABDAHI, not a
 * separate SKU. Codes never get their own pages.
 *
 * Behaviour:
 * - `ticker` mode scrolls continuously on the homepage, pauses on hover and
 *   on focus, and does not animate at all under reduced motion (the animation
 *   lives in a prefers-reduced-motion: no-preference block in globals.css).
 * - `sticky` mode is the static sub-header on /products.
 * - Hovering or focusing a code reveals its taste profile in a slim inline
 *   panel, reserved at a fixed height so revealing it cannot shift the page.
 * - Every code is a real link in the DOM, server-rendered and crawlable.
 */
export function ProductCodeIndex({
  mode = "ticker",
  className,
}: {
  mode?: "ticker" | "sticky";
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const activeEntry = active
    ? codeIndex.find((entry) => entry.code === active)
    : undefined;

  const rail = (
    <ul
      className={cn(
        "flex items-center gap-8",
        mode === "ticker" && "ab-ticker-track shrink-0 pr-8"
      )}
    >
      {codeIndex.map((entry) => (
        <li key={entry.code}>
          <Link
            href={`/products/cultures/${entry.profile.productSlug}`}
            className={cn(
              "mono-ab block whitespace-nowrap py-1 transition-colors duration-150 ease-ab",
              active === entry.code
                ? "text-ab-tank"
                : "text-ab-ink-60 hover:text-ab-tank"
            )}
            onMouseEnter={() => setActive(entry.code)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(entry.code)}
            onBlur={() => setActive(null)}
          >
            {entry.code}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={cn(
        "border-y border-ab-chill bg-ab-milk",
        mode === "sticky" && "sticky top-[var(--ab-header-h)] z-30",
        className
      )}
      // Pausing on hover is a CSS concern; this only drives the label panel.
      onMouseLeave={() => setActive(null)}
    >
      <div className="container-ab">
        <div className="flex items-center gap-8 py-3">
          <span className="mono-ab hidden shrink-0 text-ab-ink-60/70 md:block">
            Product code
          </span>

          {mode === "ticker" ? (
            <div className="ab-ticker relative flex-1 overflow-hidden">
              {/* Duplicated track makes the loop continuous with no visible
                  restart. The copy is aria-hidden so a screen reader announces
                  each code once, not twice. */}
              {rail}
              <div aria-hidden="true" className="contents">
                {rail}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">{rail}</div>
          )}
        </div>

        {/* Fixed-height well: the label appears and disappears without moving
            anything around it (CLS < 0.05). */}
        <div className="h-6 pb-2" aria-live="polite">
          {activeEntry ? (
            <p className="mono-ab truncate text-ab-ink">
              {activeEntry.profile.name}
              {activeEntry.note ? ` · ${activeEntry.note}` : ""}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
