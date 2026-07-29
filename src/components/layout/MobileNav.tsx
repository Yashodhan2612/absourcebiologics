"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/content/nav";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Full-screen mobile navigation: accordion sections, with the quote CTA
 * pinned to the bottom of the overlay (Section 8).
 *
 * Accessibility: the overlay is a modal dialog — focus moves into it on open,
 * is trapped while open, Escape closes it, and focus returns to the trigger.
 * Background scroll is locked while it is open. The accordions are native
 * <details>, so they need no JavaScript of their own.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Copied out of the ref so the cleanup closes over a stable value.
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      (previouslyFocused ?? trigger)?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="rounded-ab p-2 text-ab-ink lg:hidden"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open ? (
        <div
          id="mobile-nav"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 top-[72px] z-40 flex flex-col bg-ab-milk lg:hidden"
        >
          <nav aria-label="Primary" className="flex-1 overflow-y-auto overscroll-contain">
            <ul className="container-ab flex flex-col pb-8">
              {primaryNav.map((item) =>
                item.children ? (
                  <li key={item.label}>
                    <details className="group border-b border-ab-chill">
                      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[1.25rem] text-ab-ink [&::-webkit-details-marker]:hidden">
                        {item.label}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                          className="text-ab-ink-60 transition-transform duration-150 ease-ab group-open:rotate-45"
                        >
                          <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </summary>
                      <ul className="flex flex-col gap-1 pb-4">
                        <li>
                          <Link
                            href={item.href}
                            className="mono-ab block py-2 text-ab-tank no-underline"
                          >
                            All {item.label.toLowerCase()} &rarr;
                          </Link>
                        </li>
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block py-2 text-ab-ink-60 no-underline hover:text-ab-tank"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ) : (
                  <li key={item.label} className="border-b border-ab-chill">
                    <Link
                      href={item.href}
                      className="block py-4 text-[1.25rem] text-ab-ink no-underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>

          <div className="border-t border-ab-chill bg-ab-milk p-6">
            <ButtonLink href="/request-a-quote" size="lg" className="w-full">
              Request a quote
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </>
  );
}
