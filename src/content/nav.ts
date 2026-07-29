import { solutions } from "./solutions";
import { services } from "./services";
import { cultures, ingredients, tasteMakers } from "./products";

/**
 * Buyer-shaped information architecture (Section 8).
 *
 * The live site's nav is org-chart-shaped — "AB-About Us", "AB-DVS Cultures".
 * This replaces it with navigation organised by customer problem: application
 * first, then product. Header, mega menu, mobile nav, footer and sitemap all
 * read from here, so the IA cannot drift between them.
 */

export type NavLink = {
  readonly href: string;
  readonly label: string;
  readonly description?: string;
  /** Renders with the live/active treatment in the mega menu. */
  readonly highlighted?: boolean;
};

export type NavItem = {
  readonly label: string;
  readonly href: string;
  /** A description column on the left of the mega panel — the Novonesis
   *  pattern: say what this section is for before listing links. */
  readonly panelIntro?: string;
  readonly children?: readonly NavLink[];
};

export const primaryNav: readonly NavItem[] = [
  {
    label: "Solutions",
    href: "/solutions",
    panelIntro:
      "Start from what you are making. Each application page carries the technical challenge, the cultures we would trial, and the process parameters.",
    children: solutions.map((s) => ({
      href: `/solutions/${s.slug}`,
      label: s.name,
      description: s.summary,
    })),
  },
  {
    label: "Products",
    href: "/products",
    panelIntro:
      "Twenty-one SKUs across cultures, ingredients and taste makers. Every culture carries a strain code.",
    children: [
      {
        href: "/products?category=cultures",
        label: `DVS starter cultures (${cultures.length})`,
        description: "Freeze-dried, phage-resistant, ready for the vat",
      },
      {
        href: "/products?category=ingredients",
        label: `Dairy ingredients (${ingredients.length})`,
        description: "Stabilisers, proteins and microbial rennet",
      },
      {
        href: "/products?category=taste-makers",
        label: `Taste makers (${tasteMakers.length})`,
        description: "Savoury seasoning systems for dairy",
      },
      {
        href: "/culture-selector",
        label: "Culture Selector",
        description: "Narrow 13 culture lines to 3 in under a minute",
        highlighted: true,
      },
    ],
  },
  {
    label: "Services",
    href: "/services",
    panelIntro:
      "The work around the culture: developing a new blend, building the plant, and testing what comes out of it.",
    children: services.map((s) => ({
      href: `/services/${s.slug}`,
      label: s.name,
      description: s.summary,
    })),
  },
  { label: "Why ABsource", href: "/why-absource" },
  { label: "Quality", href: "/quality" },
  {
    label: "Company",
    href: "/about",
    panelIntro:
      "Founded in Pune in 2014 by a scientist and a biotechnologist. In commercial production since 2016.",
    children: [
      { href: "/about", label: "About", description: "Why the company exists" },
      { href: "/about/leadership", label: "Leadership", description: "The founders" },
      { href: "/customers", label: "Customers", description: "Who we supply" },
      { href: "/news", label: "News & events", description: "Exhibitions and technical notes" },
      { href: "/careers", label: "Careers", description: "Open roles" },
    ],
  },
  // Deliberately a distinct top-level item rather than a Company child — the
  // export audience is a different buyer with different copy (Section 2).
  { label: "Export", href: "/export" },
];

export const footerNav: readonly { title: string; links: readonly NavLink[] }[] = [
  {
    title: "Solutions",
    links: solutions.map((s) => ({ href: `/solutions/${s.slug}`, label: s.name })),
  },
  {
    title: "Products",
    links: [
      { href: "/products?category=cultures", label: "DVS starter cultures" },
      { href: "/products?category=ingredients", label: "Dairy ingredients" },
      { href: "/products?category=taste-makers", label: "Taste makers" },
      { href: "/culture-selector", label: "Culture Selector" },
      { href: "/downloads", label: "Data sheets" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/why-absource", label: "Why ABsource" },
      { href: "/quality", label: "Quality" },
      { href: "/about", label: "About" },
      { href: "/about/leadership", label: "Leadership" },
      { href: "/customers", label: "Customers" },
      { href: "/news", label: "News & events" },
      { href: "/careers", label: "Careers" },
    ],
  },
  {
    title: "Get in touch",
    links: [
      { href: "/request-a-quote", label: "Request a quote" },
      { href: "/export", label: "Export enquiries" },
      { href: "/services/custom-culture-development", label: "Custom culture development" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export const legalNav: readonly NavLink[] = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
];
