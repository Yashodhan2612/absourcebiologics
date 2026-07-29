"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect on the client, useEffect on the server.
 *
 * EVERY GSAP setup/teardown on this site must use this, not useEffect, and the
 * reason is a crash rather than a preference.
 *
 * ScrollTrigger's `pin` wraps the pinned element in a `.pin-spacer` div and
 * moves the element inside it. React still believes that element is a direct
 * child of wherever it rendered it. On unmount React calls
 * `parent.removeChild(element)` and the browser throws
 *
 *   Failed to execute 'removeChild' on 'Node':
 *   The node to be removed is not a child of this node.
 *
 * which React escalates into "Application error: a client-side exception has
 * occurred". The teardown that would have un-wrapped the spacer has to run
 * BEFORE React touches the DOM.
 *
 * React runs layout-effect cleanups during the mutation phase, before removing
 * host nodes. It defers PASSIVE effect (useEffect) cleanups until after the
 * commit — by which time the removal has already been attempted and thrown.
 * So the choice of hook here is load-bearing.
 *
 * useLayoutEffect warns when it runs during server rendering, hence the swap.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
