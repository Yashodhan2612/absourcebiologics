import { describe, it, expect } from "vitest";
import { inboxFor } from "./email";
import type { LeadType } from "./schema";

/**
 * Inbox routing.
 *
 * This is the one piece of the lead pipeline whose failure is completely
 * silent: a misrouted submission still returns 200, still shows the requester
 * a success state, and still sends them an autoresponse. The only symptom is
 * that nobody who can act on it ever sees it.
 *
 * The site collects leads for three different departments and the client was
 * explicit about which goes where, so each one is pinned here.
 */
describe("inboxFor", () => {
  it("sends job applications to HR, not sales", () => {
    expect(inboxFor({ leadType: "careers" })).toBe("hr@absourcebiologics.com");
  });

  it("sends vendor audit requests to QA, not sales", () => {
    expect(inboxFor({ leadType: "audit" })).toBe("qa@absourcebiologics.com");
  });

  it.each(["quote", "export", "download", "selector", "contact"] as const)(
    "sends %s enquiries to the sales inbox",
    (leadType) => {
      expect(inboxFor({ leadType })).toBe("info@absourcebiologics.com");
    }
  );

  /**
   * The routing map is a total Record<LeadType, string>, so a new lead type is
   * a compile error until it is routed. This asserts the runtime half: every
   * type resolves to a real address rather than undefined.
   */
  it("routes every lead type to a real address", () => {
    const all: readonly LeadType[] = [
      "quote",
      "export",
      "download",
      "selector",
      "contact",
      "careers",
      "audit",
    ];
    for (const leadType of all) {
      expect(inboxFor({ leadType })).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    }
  });
});
