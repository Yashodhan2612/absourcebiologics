/**
 * Leadership.
 *
 * TWO DELIBERATE OMISSIONS, both flagged in CONTENT-TODO.md:
 *
 * 1. Tenure. The live site's bios both read "ABsource Biologics – 5 Years"
 *    against a 2014 founding. That is stale, and an export buyer running
 *    diligence will do the arithmetic. Rather than silently rewriting it to a
 *    number nobody has confirmed, the tenure line is omitted entirely.
 *
 * 2. Employer names. The live site spells "Cadillac pharma" and "Biological
 *    Evans". These are almost certainly Cadila Pharmaceuticals and Biological
 *    E. The corrected spellings are used here because publishing the originals
 *    would itself damage credibility, but both are marked `pendingVerification`
 *    so they are confirmed rather than assumed.
 */

export type Leader = {
  readonly slug: string;
  readonly name: string;
  readonly role: string;
  readonly qualifications: readonly string[];
  readonly bio: string;
  readonly previously: readonly string[];
  readonly image: string;
  readonly pendingVerification?: readonly string[];
};

export const leadership: readonly Leader[] = [
  {
    slug: "mukesh-vinze",
    name: "Dr. Mukesh Vinze",
    role: "Founder & Managing Director",
    qualifications: [
      "M.Sc. Life Science",
      "Ph.D. Biochemistry, NDRI Karnal",
    ],
    bio: "A biochemist by training, Dr. Vinze has spent over twenty years in biologics and life sciences before turning that work to dairy fermentation. ABsource's position — that the science should sit inside the company rather than be bought in — follows directly from his background.",
    previously: [
      "Cadila Pharmaceuticals",
      "Fabtech Technologies International",
      "Serum Institute of India",
      "Biological E",
    ],
    image: "/assets/team/mukesh-vinze.webp",
    pendingVerification: [
      "Employer names 'Cadila Pharmaceuticals' and 'Biological E' are corrections of the live site's 'Cadillac pharma' and 'Biological Evans'. Confirm both.",
      "Confirm years of experience — the live bio's '5 Years' at ABsource contradicts a 2014 founding.",
    ],
  },
  {
    slug: "jagannath-sonavane",
    name: "Mr. Jagannath Sonavane",
    role: "Founder & Chairman",
    qualifications: [
      "B.Sc. Zoology",
      "M.Sc. Biotechnology / Life Science",
    ],
    bio: "A biotechnologist who has built companies across the life sciences, Mr. Sonavane is a founder-director of BioResource Biotech, BioSphere Life-Sci and Avanira Biotech. ABsource is a group company of BioResource Biotech.",
    previously: [
      "Invitrogen Corporation, USA",
      "BioResource Biotech — founder-director",
      "BioSphere Life-Sci — founder-director",
      "Avanira Biotech — founder-director",
    ],
    image: "/assets/team/jagannath-sonavane.webp",
    pendingVerification: [
      "Confirm years of experience — the live bio's '5 Years' at ABsource contradicts a 2014 founding.",
    ],
  },
];
