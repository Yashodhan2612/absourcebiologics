"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { cultures } from "@/content/products";

/**
 * The strain register rail — the site's signature element (Section 7).
 *
 * The strain code system (CU01, LF01, YC01 ...) is a genuine artifact of the
 * business, not decoration, so it is used as a structural device: a horizontal
 * monospace rail of all thirteen codes, like a strain register on a lab wall.
 *
 * Behaviour:
 * - `ticker` mode scrolls continuously on the homepage, pauses on hover and
 *   on focus, and does not animate at all under reduced motion (the animation
 *   lives in a prefers-reduced-motion: no-preference block in globals.css).
 * - `sticky` mode is the static sub-header on /products.
 * - Hovering or focusing a code reveals the SKU name and its one-line
 *   application in a slim inline panel. The panel is reserved in the layout at
 *   a fixed height so revealing it cannot shift the page.
 * - Every code is a real link in the DOM. All thirteen are server-rendered and
 *   crawlable — nothing here depends on JavaScript to exist.
 */
export function StrainIndex({
  mode = "ticker",
  className,
}: {
  mode?: "ticker" | "sticky";
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const activeProduct = active
    ? cultures.find((c) => c.strainCode === active)
    : undefined;

  const rail = (
    <ul
      className={cn(
        "flex items-center gap-8",
        mode === "ticker" && "ab-ticker-track shrink-0 pr-8"
      )}
    >
      {cultures.map((product) => (
        <li key={product.slug}>
          <Link
            href={`/products/cultures/${product.slug}`}
            className={cn(
              "mono-ab block whitespace-nowrap py-1 transition-colors duration-150 ease-ab",
              active === product.strainCode
                ? "text-ab-tank"
                : "text-ab-ink-60 hover:text-ab-tank"
            )}
            onMouseEnter={() => setActive(product.strainCode)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(product.strainCode)}
            onBlur={() => setActive(null)}
          >
            {product.strainCode}
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
            Strain index
          </span>

          {mode === "ticker" ? (
            <div className="ab-ticker relative flex-1 overflow-hidden">
              {/* Duplicated track makes the loop continuous with no visible
                  restart. The copy is aria-hidden so screen readers announce
                  thirteen codes, not twenty-six. */}
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
          {activeProduct ? (
            <p className="mono-ab truncate text-ab-ink">
              {activeProduct.name} &middot; {activeProduct.summary}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
