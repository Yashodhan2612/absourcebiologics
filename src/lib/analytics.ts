/**
 * Analytics seam.
 *
 * Deliberately thin and provider-agnostic: nothing in the app imports a
 * vendor SDK directly, so swapping or removing a provider touches this file
 * only. No personal data is ever passed in — see pickTracked in
 * useLeadSubmit.ts, which whitelists the fields that reach here.
 *
 * No analytics provider is wired up yet, and no consent banner ships, because
 * nothing here sets a non-essential cookie. If GA4 is added later it must load
 * after interactive via @next/third-parties, and the consent question needs
 * revisiting at that point (Section 11).
 */

type EventName = "lead_submitted" | "selector_completed" | "download_requested";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: EventName, properties: Record<string, string> = {}): void {
  if (typeof window === "undefined") return;

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...properties });
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", event, properties);
  }
}
