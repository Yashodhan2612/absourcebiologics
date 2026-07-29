import { company } from "./company";

/**
 * Legal pages.
 *
 * IMPORTANT: this is a factual description of what the site actually does —
 * which forms exist, what they collect, and where it goes. It is deliberately
 * narrow and makes no compliance claims (no DPDP Act or GDPR representations),
 * because those need a lawyer, not a web build.
 *
 * Have both documents reviewed before launch. Flagged in CONTENT-TODO.md.
 */
export type LegalPage = {
  readonly slug: string;
  readonly title: string;
  readonly updated: string;
  readonly sections: readonly { readonly heading: string; readonly body: readonly string[] }[];
};

export const legalPages: readonly LegalPage[] = [
  {
    slug: "privacy",
    title: "Privacy",
    updated: "2026-07-29",
    sections: [
      {
        heading: "What this covers",
        body: [
          `This describes what ${company.legalName} collects through absourcebiologics.com and what we do with it. It has not yet been reviewed by a legal adviser and should not be read as a compliance statement.`,
        ],
      },
      {
        heading: "What we collect",
        body: [
          "Only what you type into a form. That is: the quote request, the export enquiry, the contact form, the careers form, the data sheet request, and the optional email capture at the end of the Culture Selector.",
          "Depending on the form, that can include your name, work email, phone number, company, city or country, and whatever you write in the message field. The Culture Selector submission also includes the answers you gave, so a technologist can see what you specified.",
          "We do not run advertising trackers, and the site sets no non-essential cookies of its own. The map on the contact page is only loaded if you click to load it, because it is served by Google and sets its own cookies.",
        ],
      },
      {
        heading: "What we do with it",
        body: [
          `Enquiries are sent to ${company.email} and are used to reply to you. Export enquiries route to the export team.`,
          "One functional cookie is set after you request a document, so you are not asked for your email again in the same session.",
          "We do not sell your information or pass it to third parties for their own marketing.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Enquiries are kept in our email records for as long as the commercial relationship or conversation is live.",
        ],
      },
      {
        heading: "Asking us to delete it",
        body: [
          `Email ${company.email} and ask. Tell us which enquiry it relates to so we can find it.`,
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    updated: "2026-07-29",
    sections: [
      {
        heading: "About this site",
        body: [
          `absourcebiologics.com is operated by ${company.legalName}, ${company.address.line1}, ${company.address.line2}, ${company.address.city} ${company.address.postcode}, ${company.address.country}.`,
        ],
      },
      {
        heading: "Product information",
        body: [
          "Product descriptions on this site are general. Technical specifications — organism composition, incubation parameters, dosage, acidity targets, storage and shelf life — are supplied on the technical data sheet for each product, and the data sheet is the authoritative document.",
          "Nothing on this site is a warranty of performance in your process. Fermentation outcomes depend on your milk, your equipment and your conditions, which is why we recommend a trial batch against your existing control before switching.",
        ],
      },
      {
        heading: "Orders and quotations",
        body: [
          "Submitting an enquiry through this site does not create a contract. Supply is subject to a written quotation and our agreed terms of sale.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          `The content of this site is the property of ${company.legalName} unless otherwise stated.`,
        ],
      },
    ],
  },
];

export function legalBySlug(slug: string): LegalPage | undefined {
  return legalPages.find((p) => p.slug === slug);
}
