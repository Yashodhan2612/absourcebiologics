"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

/**
 * Embedded map that costs nothing until it is wanted.
 *
 * The iframe is never loaded on page load (Section 8, /contact). It mounts
 * only when the section scrolls into view AND the visitor asks for it — a
 * third-party map iframe pulls hundreds of kilobytes and sets cookies, and on
 * a throttled connection in a plant office that is a real cost for something
 * most visitors will not use.
 *
 * Requiring the click also keeps the page free of third-party cookies unless
 * the visitor opts in, which is what lets the site ship without a consent
 * banner (Section 11).
 */
export function LazyMap({ query, title }: { query: string; title: string }) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div ref={ref} className="relative aspect-[21/9] w-full bg-ab-chill">
      {loaded ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="mono-ab text-ab-ink-60">{query}</p>
          <Button
            variant="quiet"
            onClick={() => setLoaded(true)}
            disabled={!inView}
          >
            Load the map
          </Button>
          <p className="max-w-sm text-[0.875rem] text-ab-ink-60">
            The map loads from Google and sets its own cookies, so we only load it if
            you ask.
          </p>
        </div>
      )}
    </div>
  );
}
