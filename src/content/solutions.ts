import type { Solution, SpecRow } from "./types";

/**
 * The eight application families. Navigation is organised by customer problem
 * — industry then application — never by org chart (Section 6).
 *
 * Headlines are framed as the buyer's problem, not as a category label:
 * "Set curd that holds a clean cut", not "Curd & dahi solutions".
 *
 * PROCESS PARAMETERS: every incubation temperature, time, target acidity and
 * dosage is a `todo` row. These are the numbers a QA manager will trial
 * against, and publishing a guess would be worse than publishing nothing.
 */

const PROCESS_TODO: readonly SpecRow[] = [
  { label: "Incubation temperature", todo: "Confirm range in degC for this application" },
  { label: "Incubation time", todo: "Confirm hours to target acidity" },
  { label: "Target acidity", todo: "Confirm % lactic acid and target pH" },
  { label: "Recommended dosage", todo: "Confirm units per 100 L milk" },
  { label: "Cooling / setting", todo: "Confirm cooling profile and set conditions" },
];

export const solutions: readonly Solution[] = [
  {
    slug: "curd-dahi",
    name: "Curd & dahi",
    headline: "Set curd that holds a clean cut.",
    summary: "Firm set, clean break, consistent through the cold chain.",
    challenge: [
      "Curd is judged on the break. A set that weeps, slumps in the cup or loses body between the plant and the retail shelf reads as a quality failure to the consumer, whatever the lab says about the acidity.",
      "The variable most plants cannot control is the starter itself. A bulk starter propagated in-house drifts batch to batch and carries a standing contamination risk. A Direct Vat Set culture removes the propagation step entirely, so the same organisms go into every vat at the same concentration.",
    ],
    image: "/assets/solutions/curd-dahi.webp",
    processParameters: PROCESS_TODO,
    faqs: [
      {
        q: "Can we switch from our current imported culture without a plant trial?",
        a: "No, and we would not recommend it. Every switch should run as a trial batch against your existing control so you can compare set, acidity development and shelf life on your own milk.",
      },
      {
        q: "What changes for low-fat and toned milk?",
        a: "Body is the usual failure mode when fat comes down. ABDAHI LOW FAT (LF01) exists for exactly that case.",
      },
    ],
  },
  {
    slug: "yoghurt",
    name: "Yoghurt",
    headline: "One culture line across set, Greek, fruit and low-fat.",
    summary: "Set, stirred, Greek-style and fruit-prepared yoghurt.",
    challenge: [
      "Yoghurt covers several products that behave differently in the vat. A set cup, a strained Greek-style tub and a stirred fruit format place different demands on acidity development and on how the gel tolerates handling.",
      "The practical question is whether one starter can carry the range without a separate culture and a separate process per format. That is what the ABYOGURT line is intended to do.",
    ],
    image: "/assets/solutions/yoghurt.webp",
    processParameters: PROCESS_TODO,
    faqs: [
      {
        q: "Does the same culture work for Greek-style?",
        a: "ABYOGURT (YC01) is intended to cover set, Greek, fruit and low-fat. Straining changes the solids, so confirm your target texture with a technologist before scaling.",
      },
    ],
  },
  {
    slug: "cheese-paneer",
    name: "Cheese & paneer",
    headline: "Vat-ready cheese starter, without the bulk starter room.",
    summary: "Cheese starters and microbial rennet for the cheese and paneer line.",
    challenge: [
      "Running a bulk starter for cheese means running a second microbiological process alongside the first, with its own contamination risk and its own failure modes. Phage attack on a propagated starter can cost a full vat.",
      "A Direct Vat Set starter and a consistent coagulant remove that step. ABCHEESE (CH01) covers the starter side and ABRENNO supplies the microbial rennet.",
    ],
    image: "/assets/solutions/cheese-paneer.webp",
    processParameters: PROCESS_TODO,
    faqs: [
      {
        q: "Which cheese varieties does ABCHEESE cover?",
        a: "The line spans several styles. Tell us the target variety and we will confirm the right blend rather than pointing you at a catalogue page.",
      },
      {
        q: "Do you supply the coagulant as well as the starter?",
        a: "Yes — ABRENNO is a microbial rennet supplied alongside the starter.",
      },
    ],
  },
  {
    slug: "buttermilk-lassi",
    name: "Buttermilk & lassi",
    headline: "Pourable cultured drinks that stay in suspension.",
    summary: "Chach, cultured buttermilk, sweet and salted lassi.",
    challenge: [
      "Cultured drinks fail on separation and on acid drift. A product that looks right leaving the plant can whey off in the pouch, and a lassi that keeps souring through its shelf life stops being sweet.",
      "The starter sets the acid profile and how far it travels. ABCHACH (BU01) and ABLASSI (LA01) are separate lines because a salted chach and a sweet lassi want different acid development.",
    ],
    image: "/assets/solutions/buttermilk-lassi.webp",
    processParameters: PROCESS_TODO,
    faqs: [
      {
        q: "Is one culture enough for both chach and lassi?",
        a: "We keep them separate. Chach carries a sharper, more buttery profile; lassi wants a mild acid so the sweetness reads. ABSPICE is available where a savoury chach is the target.",
      },
    ],
  },
  {
    slug: "shrikhand-mishti-doi",
    name: "Shrikhand & mishti doi",
    headline: "Cultures built for products no European range optimises for.",
    summary: "Chakka base for shrikhand, and sweetened set mishti doi.",
    challenge: [
      "Shrikhand and mishti doi are regional products with specific acid and texture targets. A general-purpose yoghurt culture will ferment the milk, but it will not give a mishti doi the mild acidity a sweetened set needs, or a chakka the body that shrikhand is built on.",
      "These are the products the imported ranges were never tuned for, because the volume that justifies tuning them sits here. ABMISHTI (MD01) and ABSHRI (SH01) exist for that reason.",
    ],
    image: "/assets/solutions/shrikhand-mishti-doi.webp",
    processParameters: PROCESS_TODO,
    faqs: [
      {
        q: "Why a separate culture for mishti doi?",
        a: "A sweetened set needs a mild acid profile. Fermenting to a standard dahi acidity and then sweetening it is not the same product.",
      },
    ],
  },
  {
    slug: "cultured-ghee-butter",
    name: "Cultured ghee & butter",
    headline: "Diacetyl where you want it, and nowhere else.",
    summary: "Cream cultures ahead of butter and cultured ghee.",
    challenge: [
      "Cultured ghee and cultured butter are made on the cream, and the aroma is the product. Too little culture development and the result is indistinguishable from sweet cream; too much and the profile turns sour rather than buttery.",
      "ABCREAM (CR01) is a mesophilic cream culture intended for that buttery, diacetyl-forward profile.",
    ],
    image: "/assets/solutions/cultured-ghee-butter.webp",
    processParameters: PROCESS_TODO,
    faqs: [
      {
        q: "Does the culture survive the ghee process?",
        a: "The culture works on the cream before clarification. The aroma compounds it develops are what carry through — confirm your process with a technologist.",
      },
    ],
  },
  {
    slug: "probiotics-functional",
    name: "Probiotics & functional",
    headline: "A probiotic claim you can still make at end of shelf life.",
    summary: "Probiotic cultures for functional dairy and fermented foods.",
    challenge: [
      "A probiotic claim is a labelling commitment, not a marketing line. It has to hold at the end of shelf life, not on the day of manufacture, and that is a question about viable counts through distribution rather than about the culture alone.",
      "ABPROBIO (PB01) is the line to trial when the product carries a claim. We would rather talk through the claim wording and the count you need to hold than ship against an assumption.",
    ],
    image: "/assets/solutions/probiotics-functional.webp",
    processParameters: PROCESS_TODO,
    faqs: [
      {
        q: "Can you support the regulatory side of a probiotic claim?",
        a: "We can supply the culture and our microbiology testing service. The claim itself must be confirmed against current FSSAI requirements — talk to a technologist early.",
      },
    ],
  },
  {
    slug: "fermented-foods-beverages",
    name: "Fermented foods & beverages",
    headline: "For the product that is not on anyone's catalogue page yet.",
    summary: "Kefir, laban, cultured beverages and new fermented formats.",
    challenge: [
      "New fermented formats are where an importer runs out of road. If the product does not map onto an existing SKU in a European catalogue, the answer is usually the nearest approximation.",
      "Because we develop and manufacture here, the answer can instead be a blend built to your spec. ABKEFIR (KF01) and ABLABAN (LB01) cover established formats; anything beyond them goes through custom development.",
    ],
    image: "/assets/solutions/fermented-foods-beverages.webp",
    processParameters: PROCESS_TODO,
    faqs: [
      {
        q: "How does custom culture development actually start?",
        a: "With your product spec — what you are trying to make, the texture and acidity you want, and the process you have. Our scientists work from that rather than from a catalogue.",
      },
    ],
  },
];

export function solutionBySlug(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}
