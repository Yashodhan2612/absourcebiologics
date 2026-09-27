"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ProductCode } from "@/components/ui/ProductCode";
import {
  cultureFamilies,
  cultureProfiles,
  milkGuidance,
  type CultureFamily,
} from "@/content/cultures";

/**
 * The culture catalogue, as selectable tabs.
 *
 * WHAT THIS REPLACED. This section used to list the fourteen PRODUCT lines and
 * their placeholder codes. That conflated two levels: a product is what you
 * order (ABDAHI), a culture is the coded blend within it (AB436NX). The client
 * asked for the cultures, by their real codes, and asked that they stay off
 * /products — which lists products.
 *
 * ACCESSIBILITY. A real tablist: roving tabindex, arrow keys move between tabs,
 * Home and End jump to the ends, and each panel is labelled by its tab. Every
 * panel is server-rendered into the HTML and hidden with `hidden` rather than
 * unmounted, so all the codes are crawlable and findable with the browser's
 * own find-in-page regardless of which tab is open.
 *
 * Each profile links to the product line it is ordered against. Codes do not
 * get their own pages — a code is a way of buying a product, not a product.
 */
export function CultureLines() {
  const [active, setActive] = useState<CultureFamily>(
    cultureFamilies[0]?.key ?? "curd-dahi"
  );
  const baseId = useId();

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    const last = cultureFamilies.length - 1;
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? last
          : e.key === "ArrowRight"
            ? (index + 1) % cultureFamilies.length
            : (index - 1 + cultureFamilies.length) % cultureFamilies.length;

    const target = cultureFamilies[next];
    if (!target) return;
    setActive(target.key);
    e.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Culture lines by product family"
        className="flex flex-wrap gap-px border border-ab-chill bg-ab-chill"
      >
        {cultureFamilies.map((family, i) => {
          const selected = family.key === active;
          const count = cultureProfiles.filter((p) => p.family === family.key).length;
          return (
            <button
              key={family.key}
              type="button"
              role="tab"
              id={`${baseId}-tab-${family.key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${family.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(family.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "mono-ab flex-1 px-6 py-4 text-left transition-colors duration-150 ease-ab",
                selected
                  ? "bg-ab-tank text-ab-milk"
                  : "bg-ab-white text-ab-ink-60 hover:bg-ab-chill/50"
              )}
            >
              {family.label}
              <span
                className={cn(
                  "ml-2",
                  selected ? "text-ab-tank-300" : "text-ab-ink-60/70"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {cultureFamilies.map((family) => {
        const profiles = cultureProfiles.filter((p) => p.family === family.key);
        return (
          <div
            key={family.key}
            role="tabpanel"
            id={`${baseId}-panel-${family.key}`}
            aria-labelledby={`${baseId}-tab-${family.key}`}
            hidden={family.key !== active}
            className="border-x border-b border-ab-chill bg-ab-white"
          >
            <ul className="divide-y divide-ab-chill">
              {profiles.map((profile) => (
                <li key={profile.slug} className="p-6 md:p-8">
                  <div className="grid gap-5 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-10">
                    <div>
                      <h3 className="text-[1.25rem] leading-[1.25] text-ab-ink">
                        {profile.name}
                      </h3>
                      <p className="mt-2 text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                        {profile.summary}
                      </p>
                      <Link
                        href={`/products/cultures/${profile.productSlug}`}
                        className="link-wipe mono-ab mt-4 inline-block text-ab-tank no-underline"
                      >
                        Ordered as {profile.productSlug.toUpperCase().replace(/-/g, " ")} &rarr;
                      </Link>
                    </div>

                    <div>
                      <p className="mono-ab mb-3 text-[0.8125rem] text-ab-ink-60">
                        Product codes
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {profile.codes.map((code) => (
                          <li key={code.code}>
                            {/* The per-code descriptor is the client's own,
                                and only the yoghurt range has them. */}
                            <span className="flex flex-col gap-1">
                              <ProductCode code={code.code} />
                              {code.note ? (
                                <span className="text-[0.8125rem] leading-[1.4] text-ab-ink-60">
                                  {code.note}
                                </span>
                              ) : null}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
        <dl className="mt-6 grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-3">
          {milkGuidance.byMilk.map((row) => (
            <div key={row.milk} className="bg-ab-white p-5">
              <dt className="mono-ab text-ab-tank">{row.milk}</dt>
              <dd className="mt-2 text-[0.9375rem] leading-[1.55] text-ab-ink-60">
                {row.leadsTo}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
