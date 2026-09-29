/**
 * The department heads.
 *
 * SOURCE: the client's own "Write up -website.docx". Seven people, not five —
 * the brief said five, the document carries seven, and dropping two would be
 * a decision about someone's job rather than an editing decision. All seven
 * are here; say which to cut and they come out.
 *
 * PORTRAITS. Supplied by the client and cropped to one consistent 3:4 size by
 * scripts/prepare-team-portraits.mjs — see that file for why they are 480x640.
 * `image` is optional: anyone without a photograph still renders, as the
 * typographic monogram card the page used before the photographs arrived.
 *
 * COPY. The bios are rewritten from the source document into the site's voice
 * (Section 13). The originals carry words the brand rules ban outright —
 * "cutting-edge", "passion" — plus some typos and mixed pronouns. Substance is
 * unchanged: role, remit and, where the document states it, length of service.
 * This is the client's own description of their own people, tightened.
 *
 * The two founders are NOT here. They have their own page at /about/leadership,
 * which carries their photographs and longer biographies, and duplicating them
 * would put the same person on the site twice.
 */

export type TeamMember = {
  readonly slug: string;
  readonly name: string;
  /** The department they head. */
  readonly department: string;
  /** Their designation, as the client states it. */
  readonly designation: string;
  readonly bio: string;
  /**
   * Portrait, 3:4. Optional — a person with no photograph falls back to a
   * monogram card rather than a gap, so adding someone never needs an image
   * before their page entry can go live.
   */
  readonly image?: string;
};

export const teamIntro = {
  eyebrow: "The team",
  title: "The team that makes it happen.",
  body: [
    "A culture leaves this building only after seven departments have each done their part — strain development, quality control, quality assurance, production, final packaging, and the commercial and people functions that keep the rest running.",
    "These are the people who head them. Between them they hold the process that turns a screened strain into a sachet a dairy can pitch into a vat and rely on.",
  ],
} as const;

export const team: readonly TeamMember[] = [
  {
    slug: "manisha-bhadekar",
    name: "Dr. Manisha Bhadekar",
    department: "Research & Quality Control",
    designation: "Senior Scientist",
    bio: "Dr. Manisha heads research and quality control, covering product development, analytical testing and process optimisation. The R&D and QC teams work together under her — developing new formulations, refining existing processes, and holding every batch to the regulatory and quality benchmarks it is released against.",
    image: "/assets/team/manisha-bhadekar.webp",
  },
  {
    slug: "prajkata-joshi",
    name: "Ms. Prajkata Joshi",
    department: "Quality Assurance",
    designation: "Manager",
    bio: "Prajkata runs quality assurance. Her remit is the testing methodology itself and the data that comes out of it — making quality a property of the process rather than a check at the end of it. Where QC measures the batch, QA governs the system that produced it.",
    image: "/assets/team/prajkata-joshi.webp",
  },
  {
    slug: "suraj-gurav",
    name: "Mr. Suraj Gurav",
    department: "Production",
    designation: "Manager",
    bio: "Suraj oversees daily production: the manufacturing schedule, the teams running it, and the standard every batch has to meet before it moves. He also holds maintenance scheduling and facility upkeep, which is what keeps equipment downtime from becoming a supply problem. Ten years with the company.",
    image: "/assets/team/suraj-gurav.webp",
  },
  {
    slug: "monika-satkar",
    name: "Ms. Monika Satkar",
    department: "Formulations",
    designation: "Executive",
    bio: "Monika runs the department that turns bulk culture into a finished sachet. Bulk cultures are blended to approved formulations and to customer-specific requirements, filled under controlled conditions against established SOPs, then labelled, packed and released for dispatch — with traceability maintained end to end.",
    image: "/assets/team/monika-satkar.webp",
  },
  {
    slug: "shailesh-deshpande",
    name: "Mr. Shailesh Deshpande",
    department: "Sales & Marketing",
    designation: "Head of Sales & Marketing",
    bio: "Shailesh leads business development for the product lines (DVS starter cultures), covering brand development, market analysis and commercial growth. Decades of experience in the category, and a working knowledge of both the traditional dairy trade and the newer end of the market.",
    image: "/assets/team/shailesh-deshpande.webp",
  },
  {
    slug: "archana-aitwade",
    name: "Ms. Archana Aitwade",
    department: "Human Resources",
    designation: "Senior HR Executive",
    bio: "Archana holds the people function: recruitment, employee relations, performance review, and compliance with labour law and internal standards. She also coordinates training and development, and supports the management team on workforce planning.",
    image: "/assets/team/archana-aitwade.webp",
  },
  {
    slug: "rushant-shinde",
    name: "Mr. Rushant Shinde",
    department: "Accounts",
    designation: "Assistant Manager",
    bio: "Rushant supports financial operations and client account management — budgeting, financial reporting, account reconciliation and record keeping. He coordinates with clients, vendors and internal departments to keep transactions, statements and compliance current.",
    image: "/assets/team/rushant-shinde.webp",
  },
];
