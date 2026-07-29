/**
 * First focusable element on every page (Section 12). Visually hidden until
 * focused, then pinned to the top-left so a keyboard user can jump the nav.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-ab focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ab-tank focus:px-4 focus:py-2.5 focus:text-ab-milk focus:no-underline"
    >
      Skip to content
    </a>
  );
}
