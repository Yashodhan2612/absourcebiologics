"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * The workhorse scroll reveal: fade + 16px rise, 500ms, once only,
 * threshold 0.2 (Section 7A.7). Individually it should be barely noticeable.
 *
 * Progressive enhancement, deliberately:
 * - The hidden state is applied by CSS scoped to `html.js`, which is set by an
 *   inline script in the layout. With JS off or broken, content is visible.
 * - Under prefers-reduced-motion the CSS rule does not apply at all, so there
 *   is no transform and no transition (Section 7A.9).
 * - It never re-triggers, and it disconnects after firing.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.dataset.reveal = "shown";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.dataset.reveal = "shown";
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /**
   * `as` is constrained to four intrinsic tags, but TypeScript cannot narrow a
   * union of JSX tag names into a single callable signature — it intersects
   * their props and lands on `never` for children, ref and style. Casting to a
   * component that takes plain HTML attributes is the standard escape; the
   * union on the `as` prop is what actually keeps callers honest.
   */
  const Element = Tag as unknown as React.ComponentType<
    React.HTMLAttributes<HTMLElement> & {
      ref?: React.Ref<HTMLElement>;
      "data-reveal"?: string;
    }
  >;

  return (
    <Element
      ref={ref}
      data-reveal="pending"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("ab-reveal", className)}
    >
      {children}
    </Element>
  );
}
