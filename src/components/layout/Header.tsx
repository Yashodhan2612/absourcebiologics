"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { primaryNav, type NavItem } from "@/content/nav";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

const HOVER_OPEN_DELAY = 120;

/**
 * Sticky header with the Novonesis-pattern mega menu: a full-width panel with
 * a description column on the left and a link grid on the right.
 *
 * Interaction contract (Section 8 + Section 12):
 * - Desktop pointer: opens on hover after 120ms, closes when the pointer
 *   leaves the header/panel group.
 * - Keyboard: Enter or Space on the trigger opens; Escape closes and returns
 *   focus to the trigger; Tab is trapped inside the panel while it is open.
 * - The trigger carries aria-expanded and aria-controls, and the panel is
 *   labelled by its trigger.
 * - Transparent over the hero on the homepage, solid ab-milk with a 1px
 *   bottom rule once scrolled.
 *
 * Every top-level item is itself a real link, so a section is reachable
 * without ever opening a panel.
 */
export function Header() {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  /** Tracks how the panel was opened, so we only trap focus for keyboard use. */
  const openedByKeyboard = useRef(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && openLabel === null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route change closes any open panel.
  useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);

  const close = useCallback(
    (returnFocus: boolean) => {
      const label = openLabel;
      setOpenLabel(null);
      if (returnFocus && label) {
        const trigger = headerRef.current?.querySelector<HTMLButtonElement>(
          `[data-nav-trigger="${label}"]`
        );
        trigger?.focus();
      }
    },
    [openLabel]
  );

  // Escape closes and returns focus to the trigger.
  useEffect(() => {
    if (!openLabel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openLabel, close]);

  // Focus trap — only when opened from the keyboard. Trapping a hover-opened
  // panel would fight a pointer user who never asked to be in it.
  useEffect(() => {
    if (!openLabel || !openedByKeyboard.current) return;
    const panel = headerRef.current?.querySelector<HTMLElement>(
      `[data-nav-panel="${openLabel}"]`
    );
    if (!panel) return;

    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
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

    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, [openLabel]);

  const scheduleOpen = (label: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      openedByKeyboard.current = false;
      setOpenLabel(label);
    }, HOVER_OPEN_DELAY);
  };

  const cancelOpen = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled}
      className={cn(
        "ab-header sticky top-0 z-50 transition-colors duration-150 ease-ab",
        transparent ? "bg-transparent" : "border-b border-ab-chill bg-ab-milk"
      )}
      onMouseLeave={() => {
        cancelOpen();
        setOpenLabel(null);
      }}
    >
      <div className="container-ab">
        <div className="flex h-[72px] items-center justify-between gap-6">
          <Link
            href="/"
            className="shrink-0"
            aria-label="ABsource Biologics — home"
          >
            {/* 36px on mobile, 44px from md. Below about 32px the letterspaced
                "BIOLOGICS" line stops resolving; above 44px the lockup starts
                crowding the quote button on a 390px screen. */}
            <Logo className="h-9 md:h-11" priority />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => (
                <TopLevelItem
                  key={item.label}
                  item={item}
                  open={openLabel === item.label}
                  onHoverStart={() => (item.children ? scheduleOpen(item.label) : cancelOpen())}
                  onHoverEnd={cancelOpen}
                  onToggle={() => {
                    openedByKeyboard.current = true;
                    setOpenLabel(openLabel === item.label ? null : item.label);
                  }}
                  active={
                    pathname === item.href || pathname.startsWith(item.href + "/")
                  }
                />
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {/* `max-sm:hidden`, not `hidden sm:inline-flex`. ButtonLink's own
                base class sets `inline-flex`, and an unprefixed `hidden` from
                a caller sits in the same Tailwind display group — so it lost
                the cascade and the button rendered on phones anyway, wrapping
                onto two lines beside the logo. The mobile nav already pins
                this CTA to the bottom of its overlay. */}
            <ButtonLink href="/request-a-quote" className="max-sm:hidden">
              Request a quote
            </ButtonLink>
            <MobileNav />
          </div>
        </div>
      </div>

      {/* Mega panels. Rendered outside the flex row so they span full width. */}
      {primaryNav
        .filter((item) => item.children)
        .map((item) => (
          <MegaPanel
            key={item.label}
            item={item}
            open={openLabel === item.label}
          />
        ))}
    </header>
  );
}

function TopLevelItem({
  item,
  open,
  active,
  onHoverStart,
  onHoverEnd,
  onToggle,
}: {
  item: NavItem;
  open: boolean;
  active: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onToggle: () => void;
}) {
  const className = cn(
    "relative flex items-center gap-1.5 rounded-ab px-3 py-2 text-[0.9375rem] no-underline transition-colors duration-150 ease-ab",
    active || open ? "text-ab-tank" : "text-ab-ink hover:text-ab-tank"
  );

  if (!item.children) {
    return (
      <li onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}>
        <Link href={item.href} className={className}>
          {item.label}
        </Link>
      </li>
    );
  }

  const panelId = `nav-panel-${item.label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <li onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}>
      <button
        type="button"
        data-nav-trigger={item.label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={className}
      >
        {item.label}
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
          className={cn(
            "transition-transform duration-150 ease-ab",
            open && "rotate-180"
          )}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </li>
  );
}

function MegaPanel({ item, open }: { item: NavItem; open: boolean }) {
  const panelId = `nav-panel-${item.label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      id={panelId}
      data-nav-panel={item.label}
      hidden={!open}
      className="absolute inset-x-0 top-full hidden border-y border-ab-chill bg-ab-milk lg:block"
    >
      <div className="container-ab">
        <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16">
          {/* Left: say what this section is for before listing links. */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[1.5rem] text-ab-ink">{item.label}</h2>
            {item.panelIntro ? (
              <p className="text-[0.9375rem] leading-[1.6] text-ab-ink-60">
                {item.panelIntro}
              </p>
            ) : null}
            <Link
              href={item.href}
              className="link-wipe mono-ab mt-2 self-start text-ab-tank no-underline"
            >
              All {item.label.toLowerCase()} &rarr;
            </Link>
          </div>

          {/* Right: the link grid. */}
          <ul className="grid gap-x-10 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
            {item.children?.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "group block border-b border-ab-chill py-4 no-underline transition-colors duration-150 ease-ab",
                    child.highlighted && "border-b-ab-culture"
                  )}
                >
                  <span
                    className={cn(
                      "block text-[1.0625rem] text-ab-ink transition-colors duration-150 ease-ab group-hover:text-ab-tank",
                      child.highlighted && "text-ab-tank"
                    )}
                  >
                    {child.label}
                    {child.highlighted ? (
                      <span className="mono-ab ml-2 align-middle text-ab-culture">
                        Tool
                      </span>
                    ) : null}
                  </span>
                  {child.description ? (
                    <span className="mt-1 block text-[0.875rem] text-ab-ink-60">
                      {child.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
