/**
 * The department heads.
 *
 * SOURCE: the client's own "Write up -website.docx". Seven people, not five —
 * the brief said five, the document carries seven, and dropping two would be
 * a decision about someone's job rather than an editing decision. All seven
 * are here; say which to cut and they come out.
 *
 * NO PORTRAITS. None were supplied, and this page renders a typographic card
 * per person by design rather than leaving broken image slots or filling them
 * with stock photographs of people who do not work here. When real portraits
 * arrive, add `image` to this type and the grid takes them without a redesign.
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
    name: "Ms. Manisha Bhadekar",
    department: "Research & Quality Control",
    designation: "Senior Scientist",
    bio: "Manisha heads research and quality control, covering product development, analytical testing and process optimisation. The R&D and QC teams work together under her — developing new formulations, refining existing processes, and holding every batch to the regulatory and quality benchmarks it is released against.",
  },
  {
    slug: "prajkata-joshi",
    name: "Ms. Prajkata Joshi",
    department: "Quality Assurance",
    designation: "Manager",
    bio: "Prajkata runs quality assurance. Her remit is the testing methodology itself and the data that comes out of it — making quality a property of the process rather than a check at the end of it. Where QC measures the batch, QA governs the system that produced it.",
  },
  {
    slug: "suraj-gurav",
    name: "Mr. Suraj Gurav",
    department: "Production",
    designation: "Manager",
    bio: "Suraj oversees daily production: the manufacturing schedule, the teams running it, and the standard every batch has to meet before it moves. He also holds maintenance scheduling and facility upkeep, which is what keeps equipment downtime from becoming a supply problem. Ten years with the company.",
  },
  {
    slug: "monika-satkar",
    name: "Ms. Monika Satkar",
    department: "Final Packaging",
    designation: "Executive",
    bio: "Monika runs the department that turns bulk culture into a finished sachet. Bulk cultures are blended to approved formulations and to customer-specific requirements, filled under controlled conditions against established SOPs, then labelled, packed and released for dispatch — with traceability maintained end to end.",
  },
  {
    slug: "shailesh-deshpande",
    name: "Mr. Shailesh Deshpande",
    department: "Sales & Marketing",
    designation: "Head of Sales & Marketing",
    bio: "Shailesh leads business development for the DVS culture range, covering brand development, market analysis and commercial growth. Decades of experience in the category, and a working knowledge of both the traditional dairy trade and the newer end of the market.",
  },
  {
    slug: "archana-aitwade",
    name: "Ms. Archana Aitwade",
    department: "Human Resources",
    designation: "Senior HR Executive",
    bio: "Archana holds the people function: recruitment, employee relations, performance review, and compliance with labour law and internal standards. She also coordinates training and development, and supports the management team on workforce planning.",
  },
  {
    slug: "rushant-shinde",
    name: "Mr. Rushant Shinde",
    department: "Accounts",
    designation: "Assistant Manager",
    bio: "Rushant supports financial operations and client account management — budgeting, financial reporting, account reconciliation and record keeping. He coordinates with clients, vendors and internal departments to keep transactions, statements and compliance current.",
  },
];
