"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ProductCode } from "@/components/ui/ProductCode";
import { products } from "@/content/products";
import {
  families,
  milkGuidance,
  productSlugFor,
  publicFamilies,
  publicVariants,
  styleLabel,
  type FamilyKey,
  type Variant,
} from "@/content/variants";

/**
 * The culture catalogue, as selectable tabs — every coded variant the client's
 * master sheet lists, one tab per family.
 *
 * WHAT THIS IS FOR. A product is what you order (ABDAHI); a variant is the
 * coded culture within it (AB436NX). The client asked for the variants, by
 * their real codes, and asked that they stay off /products — which lists
 * products. This is the full list and mapping behind the selector above it.
 *
 * ACCESSIBILITY. A real tablist: roving tabindex, arrow keys move between tabs,
 * Home and End jump to the ends, and each panel is labelled by its tab. Every
 * panel is server-rendered into the HTML and hidden with `hidden` rather than
 * unmounted, so all the codes are crawlable and findable with the browser's
 * own find-in-page regardless of which tab is open.
 *
 * Each variant links to the product line it is ordered against. Codes do not
 * get their own pages — a code is a way of buying a product, not a product.
 */

function productFor(variant: Variant) {
  const slug = productSlugFor(variant);
  return products.find((p) => p.slug === slug);
}

/** Variants of a family, grouped by sub-type where the family has them. */
function groupsOf(family: FamilyKey): readonly { label: string | null; variants: readonly Variant[] }[] {
  const own = publicVariants.filter((v) => v.family === family);
  const styles = families[family].styles;
  if (!styles) return [{ label: null, variants: own }];

  const groups = styles
    .map((style) => ({
      label: style.label,
      variants: own.filter((v) => v.style?.includes(style.value)),
    }))
    .filter((group) => group.variants.length > 0);
  // A variant the sheet lists without a sub-type still has to appear.
  const unstyled = own.filter((v) => !v.style?.length);
  return unstyled.length > 0 ? [...groups, { label: "General", variants: unstyled }] : groups;
}

export function CultureLines() {
  const [active, setActive] = useState<FamilyKey>(publicFamilies[0] ?? "curd");
  const baseId = useId();

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    const last = publicFamilies.length - 1;
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? last
          : e.key === "ArrowRight"
            ? (index + 1) % publicFamilies.length
            : (index - 1 + publicFamilies.length) % publicFamilies.length;

    const target = publicFamilies[next];
    if (!target) return;
    setActive(target);
    e.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  };

  return (
    <div>
      {/* Fourteen tabs do not fit one row, so the strip wraps. `grow` lets
          each row fill its width, which keeps the hairline ground from
          showing as an empty cell at the end of a row. */}
      <div
        role="tablist"
        aria-label="Cultures by product family"
        className="flex flex-wrap gap-px border border-ab-chill bg-ab-chill"
      >
        {publicFamilies.map((family, i) => {
          const selected = family === active;
          const count = publicVariants.filter((v) => v.family === family).length;
          return (
            <button
              key={family}
              type="button"
              role="tab"
              id={`${baseId}-tab-${family}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${family}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(family)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "mono-ab grow whitespace-nowrap px-5 py-4 text-left transition-colors duration-150 ease-ab",
                selected
                  ? "bg-ab-tank text-ab-milk"
                  : "bg-ab-white text-ab-ink-60 hover:bg-ab-chill/50"
              )}
            >
              {families[family].label}
              <span
                className={cn("ml-2", selected ? "text-ab-tank-300" : "text-ab-ink-60/70")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {publicFamilies.map((family) => {
        const groups = groupsOf(family);
        const line = products.find((p) => p.slug === families[family].productSlug);
        return (
          <div
            key={family}
            role="tabpanel"
            id={`${baseId}-panel-${family}`}
            aria-labelledby={`${baseId}-tab-${family}`}
            hidden={family !== active}
            className="border-x border-b border-ab-chill bg-ab-white"
          >
            {line ? (
              <p className="border-b border-ab-chill px-6 py-4 text-[0.9375rem] text-ab-ink-60 md:px-8">
                Ordered as{" "}
                <Link
                  href={`/products/${line.category}/${line.slug}`}
                  className="link-wipe text-ab-tank no-underline"
                >
                  {line.name}
                </Link>
                , unless a variant below says otherwise.
              </p>
            ) : null}

            {groups.map((group) => (
              <div key={group.label ?? family} className="border-b border-ab-chill last:border-b-0">
                {group.label ? (
                  <h3 className="mono-ab bg-ab-chill/30 px-6 py-3 text-ab-ink md:px-8">
                    {group.label}
                  </h3>
                ) : null}
                <ul className="divide-y divide-ab-chill">
                  {group.variants.map((variant) => {
                    const orderedAs = productFor(variant);
                    const elsewhere = orderedAs && orderedAs.slug !== families[family].productSlug;
                    return (
                      <li
                        key={variant.code}
                        className="grid gap-2 px-6 py-4 md:grid-cols-[8rem_1fr] md:gap-6 md:px-8"
                      >
                        <ProductCode code={variant.code} />
                        <div>
                          <p className="text-[0.9375rem] leading-[1.6] text-ab-ink">
                            {variant.descriptor}
                          </p>
                          {/* Listed under more than one sub-type: say so here
                              rather than leave it looking like a duplicate. */}
                          {(variant.style?.length ?? 0) > 1 ? (
                            <p className="mt-1 text-[0.8125rem] leading-[1.5] text-ab-ink-60">
                              Listed for{" "}
                              {variant.style!.map((s) => styleLabel(family, s)).join(" and ")}.
                            </p>
                          ) : null}
                          {elsewhere ? (
                            <p className="mt-1 text-[0.8125rem] leading-[1.5] text-ab-ink-60">
                              Ordered as{" "}
                              <Link
                                href={`/products/${orderedAs.category}/${orderedAs.slug}`}
                                className="link-wipe text-ab-tank no-underline"
                              >
                                {orderedAs.name}
                              </Link>
                              .
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        );
      })}

      {/* The client's own selection rule. It is the first thing a technologist
          is asked and the thing buyers most often get wrong, so it sits with
          the catalogue rather than in a data sheet. */}
      <div className="mt-10 border border-ab-chill bg-ab-chill/30 p-6 md:p-8">
        <p className="text-[1.0625rem] leading-[1.5] text-ab-ink">
          {milkGuidance.intro}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {milkGuidance.factors.map((factor) => (
            <li
              key={factor}
              className="text-[0.9375rem] leading-[1.6] text-ab-ink-60"
            >
              {factor}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
