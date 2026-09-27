/**
 * The approved brand narrative, held as typed structures so the homepage and
 * /why-absource render from one source and cannot drift apart.
 *
 * Source: the client's own Vision, Product & Culture Proposition, Our Promise,
 * Our Solution and The Value We Deliver documents. Tightened per Section 13
 * (banned words stripped, sentence case, active voice) but never contradicted
 * and never extended with invented claims.
 *
 * CLAIMS DISCIPLINE — the one hard rule in this file.
 * The source documents pair the word "first" with an exclusivity word. The
 * exclusivity half is not defensible: a national Ready-to-Use Culture plant opened at
 * Anand in July 2025, so a second indigenous manufacturer now exists and a
 * government body publicly claims the "first plant" title. "Only" appears
 * nowhere in this codebase. The defensible framing — first, dated, and
 * verifiable — is in `positioning` below and is used everywhere.
 *
 * RUC (Ready-to-Use Culture) and DVS (Direct Vat Set) describe the same
 * category. Nothing here implies they are different technologies.
 */

export const company = {
  legalName: "ABsource Biologics Pvt. Ltd.",
  shortName: "ABsource Biologics",
  foundedYear: 2014,
  firstCommercialYear: 2016,
  group: "BioResource Biotech",
  address: {
    line1: "Kinetic Innovation Park, D-1 Block",
    line2: "Plot No. 18/1 Part, MIDC Chinchwad",
    city: "Pune",
    postcode: "411019",
    country: "India",
  },
  email: "info@absourcebiologics.com",
  /**
   * Departmental inboxes. Recruitment and vendor audits do not belong in the
   * sales inbox: different people answer them, on different timescales, and a
   * candidate's CV sitting in a sales queue is how applications get lost.
   *
   * These are display addresses. Where the SERVER routes a submission is set
   * in src/lib/email.ts, which reads them from environment variables so a
   * preview deploy can point elsewhere. Keep the two in step.
   */
  hrEmail: "hr@absourcebiologics.com",
  qaEmail: "qa@absourcebiologics.com",
  phones: ["+91 91686 96640", "+91 90283 11133"],
} as const;

/** The positioning line, used verbatim wherever the pioneer claim is made. */
export const positioning = {
  claim:
    "India's first indigenous DVS starter culture manufacturer, in commercial production since 2016.",
  claimLong:
    "India's first indigenous DVS starter culture manufacturer. In commercial production since 2016 — nine years before the national Ready-to-Use Culture plant opened at Anand.",
  thesis: "India's dairy shouldn't have to import its bacteria.",
  subhead:
    "Direct Vat Set starter cultures, developed and manufactured in Pune. Supplied across India and to export markets. Delivered in three to five days in India.",
} as const;

/**
 * The market argument. This opens /about — demand-side pull against a
 * supply-side vacuum is the strongest thing in the source documents, and it is
 * a better opening than a mission statement.
 */
export const marketArgument = {
  heading: "Demand is rising. Almost nobody in India makes the cultures.",
  body: [
    "Indian demand for high-quality dairy starters is climbing with consumer awareness. Supply has not followed, because very few manufacturers of these cultures exist in the country at all.",
    "That gap is the reason ABsource was founded. A technological platform for dairy starter cultures, built on advanced biotechnological processes, serving the regional differences that make Indian dairy what it is — and doing it from a supply chain that starts in Pune.",
  ],
} as const;

/** Vision and global ambition. Used on /about and /careers — deliberately kept
 *  off the homepage, because a procurement head does not buy on ambition. */
export const vision = {
  heading: "Where we are going",
  body: "ABsource aims to become the largest manufacturer of dairy starter cultures in India, and to rank among the top three globally.",
} as const;

/**
 * The proposition. Carries the sharpest sentence the client has written.
 *
 * The body was rewritten after client review. What it used to say listed the
 * same disciplines three times over — "a company of scientists ... founded by
 * a scientist and a biotechnologist, backed by microbiologists,
 * biotechnologists and dairy technologists" — seven discipline nouns carrying
 * one fact. It also repeated the certification list (already on the proof bar
 * directly above) and the import-cost argument (already in challengeResponse
 * directly below).
 *
 * What is here now substantiates both halves of the headline instead: body[0]
 * is the "manufacturers" claim, body[1] the "innovators" claim. Do not re-add
 * the certification list or the discipline roll-call.
 *
 * "the cultures we sell", not "every culture we sell": the categorical form
 * would assert that ABsource manufactures the seven dairy ingredients and the
 * taste maker too, which nothing in products.ts supports.
 */
export const proposition = {
  headline: "We are not traders; we are manufacturers and innovators.",
  body: [
    "We make the cultures we sell. Strain screening, fermentation, freeze-drying and batch release all happen in our own clean-room facility, with an in-process QC lab on site.",
    "A scientist and a biotechnologist founded the company, and we still develop every blend in our own R&D lab. The science sits inside the company rather than being bought in.",
  ],
} as const;

/**
 * The closing line of "Why we exist" — the four credentials behind the claim.
 *
 * WORDING IS THE CLIENT'S OWN, supplied verbatim. Two notes for whoever edits
 * this next, so neither gets "corrected" by accident:
 *
 *  1. "State-of-the-Art" is on the banned-words list in Section 13 of the
 *     build brief. It is here because the client specified this line
 *     explicitly. Their copy decision overrides the house style rule; do not
 *     silently rewrite it, raise it with them.
 *
 *  2. GMP is the one credential on this list with NO supporting document in
 *     the asset set. ISO 9001, ISO 22000 and HALAL are all in
 *     certifications.ts with scans; GMP is not, and the FSSAI licence does not
 *     mention it either. It is published on the client's own assertion.
 *     Tracked in CONTENT-TODO.md §0h — get the certificate.
 *
 * `body` is optional and omitted here: these are credentials, not capability
 * descriptions, and padding each with a sentence would dilute them.
 */
export type Capability = {
  readonly id: string;
  readonly title: string;
  /** Optional supporting line. Omitted for credentials, which stand alone. */
  readonly body?: string;
};

export const capabilities: readonly Capability[] = [
  { id: "clean-rooms", title: "State-of-the-Art Clean Rooms" },
  { id: "gmp", title: "GMP compliance certificate" },
  { id: "iso", title: "ISO 9001, ISO 22000 certified company" },
  { id: "halal", title: "HALAL certified products" },
];

/** Our promise — four commitments. Parallel structure retained deliberately. */
export const promise = {
  heading: "Our promise",
  commitments: [
    {
      title: "Uncompromising quality",
      body: "In every culture we produce, backed by rigorous science and manufacturing standards that hold up to audit.",
    },
    {
      title: "True partnership",
      body: "Our expertise, our resources and our support directed at your goals — not just a product against a purchase order.",
    },
    {
      title: "Continuous innovation",
      body: "Pushing dairy science toward new flavours, new textures and new possibilities.",
    },
    {
      title: "Indigenous capability",
      body: "Proving that 'Made in India' is a benchmark for the highest quality.",
    },
  ],
  closing:
    "When you work with ABsource you are not just buying a starter culture. You are investing in a partnership that guarantees consistency, fosters innovation, and builds a stronger, self-reliant Indian dairy ecosystem.",
} as const;

/**
 * The market, widened.
 *
 * Added at the client's request: the homepage was framed entirely on Indian
 * dairy and they asked for the international picture and the company's vision
 * to sit alongside it.
 *
 * Carries NO NUMBER, deliberately. stats.countriesServed is flagged unverified
 * ("5+" reads small beside "300+ customers" and CONTENT-TODO says do not
 * inflate it), so the international claim is made on what ABsource actually
 * does — supplying importers and distributors, certifying for overseas audit,
 * developing blends to order — rather than on a figure nobody has confirmed.
 *
 * The framing is deliberately not import-substitution. That argument is the
 * page's one permitted self-reliance instance and it already lives in the hero
 * headline; running it again here would breach the once-per-page rule.
 */
export const globalReach = {
  eyebrow: "The market",
  title: "What we built for Indian dairy now leaves Pune for export markets.",
  body: [
    "Any plant that ferments milk depends on a starter culture, and where that culture is made decides the lead time, the currency it is priced in, and whether anyone will adjust the blend when the product has to change. That is as true outside India as it is inside it.",
    "So we supply importers and distributors directly, on the certifications an overseas buyer's own audit asks for, and we develop new blends for products a global catalogue does not carry.",
  ],
} as const;

/** Five differentiators — backbone of /why-absource and the homepage. */
export const differentiators = [
  {
    id: "pioneer",
    title: "The pioneer advantage",
    // "longer than anyone else in India" is not a claim anyone has sourced,
    // and it is a superlative of the kind the brief bans outright. The dated
    // form says the same thing and is checkable.
    body: "Founded in 2014, in commercial production from 2016 — nine years before the national Ready-to-Use Culture plant opened at Anand. That is nearly a decade of production data behind every batch we ship.",
  },
  {
    id: "science-led",
    title: "Science-led, not sales-led",
    body: "Our founders are a scientist and a biotechnologist. The advice you get is grounded in microbiology, and the work starts from your problem rather than from a catalogue page.",
  },
  {
    id: "breadth",
    title: "Portfolio breadth and customisation",
    body: "Fourteen distinct culture lines spanning dahi, lassi, a wide cheese range and probiotic foods — plus in-house R&D that builds entirely new cultures from scratch, which an importer structurally cannot do.",
  },
  {
    id: "end-to-end",
    title: "End-to-end partnership",
    body: "Arrive with an idea and get culture development, plant setup and product safety testing from one company.",
  },
  {
    id: "proven",
    title: "Proven quality and trust",
    body: "300+ customers, commercial production since 2016, and ISO 9001:2015, ISO 22000:2018, HACCP and HALAL certification."
  },
] as const;

/**
 * Challenge → response. The single best piece of source material provided, and
 * the section that does the actual selling. Rendered as a two-column editorial
 * list on desktop and a stacked accordion on mobile — never a card grid, never
 * with icons, never numbered. These are parallel problems, not a sequence.
 *
 * Every row carries a stable `id` so the homepage can render a subset without
 * duplicating the array. The whole point of sharing this data between the
 * homepage and /why-absource is that the two cannot drift apart — a second
 * copy would defeat it.
 */
export const challengeResponse = [
  {
    id: "import-dependency",
    challenge: "Import dependency",
    response:
      "Manufacturing here breaks reliance on expensive, often inconsistent foreign supply, and it secures the supply chain against a disruption you cannot control.",
  },
  {
    id: "inconsistent-quality",
    challenge: "Inconsistent quality",
    response:
      "Freeze-dried, phage-resistant DVS cultures remove the variability of traditional bulk starters. Bacterial concentration and purity are guaranteed through 24 quality checks.",
  },
  {
    id: "production-cost",
    challenge: "High production cost",
    response:
      "Local manufacture delivers the same standard of culture at a lower price point than imports, which improves your margin directly.",
  },
  {
    id: "expertise-gap",
    challenge: "Technical expertise gap",
    response:
      "Direct Vat Set means ready to use. No in-house propagation, no specialist propagation skills, far lower contamination risk.",
  },
  {
    id: "no-customisation",
    challenge: "No customisation",
    response:
      "Bespoke culture development: our scientists work directly with you to build a unique blend — a creamier dahi, a sharper cheese, a novel fermented beverage.",
  },
  {
    id: "fragmented-support",
    challenge: "Fragmented support",
    response:
      "Custom product development and turnkey plant consultancy alongside the cultures themselves.",
  },
] as const;

/**
 * The value we deliver. Maps to how a plant justifies a supplier switch
 * internally, so the categories are kept intact.
 *
 * `strategic` is domestic-only. On /export it is replaced by `exportStrategic`
 * below — self-reliance framing is irrelevant to a distributor in Dubai or
 * Dhaka and is banned on that page (Section 2, Section 13).
 */
export const valueDelivered = [
  {
    id: "economic",
    value: "Economic",
    body: "A cost-effective alternative to imported cultures. Improved yield and reduced waste lift profitability directly.",
  },
  {
    id: "operational",
    value: "Operational",
    body: "Ready-to-use DVS simplifies production, reduces batch-failure risk from contamination, and delivers consistent output.",
  },
  {
    id: "quality",
    value: "Quality & brand",
    body: "Consistent taste, texture and aroma let you build brand reputation and hold consumer loyalty.",
  },
  {
    id: "innovation",
    value: "Innovation",
    body: "Custom culture development lets you launch products that capture emerging consumer trends before the category does.",
  },
  {
    id: "strategic",
    value: "Strategic",
    body: "De-risks your supply chain from global disruption and aligns your brand with Make in India and food security.",
  },
] as const;

/** Replaces the `strategic` row on /export. Same facts, re-cut for a buyer to
 *  whom Indian self-reliance is not a selling point. */
export const exportStrategicValue = {
  id: "supply",
  value: "Supply reliability",
  body: "Manufacturer-direct commercial terms with no European middleman margin, and a production schedule you can talk to directly.",
} as const;

/**
 * Milestones. Verified dates only.
 *
 * The 2025 entry is deliberate: owning that fact on your own site is far
 * stronger than having a buyer discover it elsewhere, and it converts the
 * event into third-party validation of the original thesis. It is factual and
 * non-triumphalist, it does not name or diminish any organisation, and it must
 * stay that way — several likely customers sit inside that ecosystem.
 */
export const milestones = [
  {
    year: "2014",
    title: "ABsource Biologics founded",
    body: "Established in Pune by Dr. Mukesh Vinze and Mr. Jagannath Sonavane as a group company of BioResource Biotech.",
  },
  {
    year: "2016",
    title: "First commercial DVS range",
    body: "The first Indian-manufactured Direct Vat Set dairy starter cultures reach commercial production.",
  },
  {
    year: "2025",
    title: "India's national RUC plant opens at Anand",
    body: "A Ready-to-Use Culture manufacturing plant is inaugurated at Anand, and indigenous starter culture supply becomes national policy. Ready-to-Use Culture and Direct Vat Set describe the same category — the country now agrees India should make its own cultures. We have been manufacturing them here since 2016.",
  },
] as const;

/** Three replacement taglines for "Transforming Dairy, Naturally!" — the
 *  exclamation mark and the vagueness both undercut a technical sale. The
 *  client picks one; see CONTENT-TODO.md. */
export const taglineOptions = [
  "Cultures made in India, for Indian dairy.",
  "Direct Vat Set cultures, developed and manufactured in Pune.",
  "The starter culture, made here.",
] as const;
