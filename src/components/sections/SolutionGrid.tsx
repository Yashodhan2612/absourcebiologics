import Link from "next/link";
import { CardLink, CardMedia, CardBody } from "@/components/ui/Card";
import { SolutionMedia } from "@/components/ui/PackShot";
import { SolutionIcon } from "@/components/ui/SolutionIcon";
import { Reveal } from "@/components/ui/Reveal";
import { solutions } from "@/content/solutions";

/**
 * The homepage's main navigational engine: eight application cards,
 * 3-up desktop / 2-up tablet / 1-up mobile (Section 8, homepage section 6).
 */
export function SolutionGrid() {
  return (
    <ul className="grid gap-px border border-ab-chill bg-ab-chill sm:grid-cols-2 lg:grid-cols-3">
      {solutions.map((solution, i) => (
        <Reveal as="li" key={solution.slug} delay={Math.min(i, 5) * 60}>
          <CardLink href={`/solutions/${solution.slug}`} className="h-full border-0">
            <CardMedia aspect="16/10">
              <SolutionMedia slug={solution.slug} />
            </CardMedia>
            <CardBody className="flex h-full flex-col gap-3">
              <SolutionIcon slug={solution.slug} className="h-6 w-6 text-ab-tank" />
              <h3 className="text-[1.5rem] text-ab-ink">{solution.name}</h3>
              <p className="text-[0.9375rem] leading-[1.55] text-ab-ink-60">
                {solution.summary}
              </p>
              <span className="mono-ab mt-auto pt-4 text-ab-tank">See cultures &rarr;</span>
            </CardBody>
          </CardLink>
        </Reveal>
      ))}

      {/* Eight cards in a three-column grid leaves one cell empty. Filling it
          with the catalogue link is better than leaving a hole, and gives the
          grid a natural terminus. */}
      <li className="bg-ab-white">
        <Link
          href="/products?category=cultures"
          className="group flex h-full flex-col justify-end gap-3 p-6 no-underline"
        >
          <span className="font-display text-[1.5rem] leading-tight tracking-[-0.02em] text-ab-ink transition-colors duration-150 ease-ab group-hover:text-ab-tank">
            Or start from the culture
          </span>
          <span className="text-[0.9375rem] leading-[1.55] text-ab-ink-60">
            Thirteen DVS lines, filterable by application, culture type and format.
          </span>
          <span className="mono-ab pt-4 text-ab-tank">See the catalogue &rarr;</span>
        </Link>
      </li>
    </ul>
  );
}

/** Compact variant for the solutions hub page. */
export function SolutionList() {
  return (
    <ul className="divide-y divide-ab-chill border-y border-ab-chill">
      {solutions.map((solution) => (
        <li key={solution.slug}>
          <Link
            href={`/solutions/${solution.slug}`}
            className="group grid gap-4 py-8 no-underline md:grid-cols-[auto_minmax(0,20rem)_1fr] md:items-baseline md:gap-10"
          >
            <SolutionIcon
              slug={solution.slug}
              className="h-6 w-6 shrink-0 text-ab-tank"
            />
            <h2 className="font-display text-[1.75rem] leading-tight tracking-[-0.02em] text-ab-ink transition-colors duration-150 ease-ab group-hover:text-ab-tank">
              {solution.name}
            </h2>
            <p className="measure-ab text-base text-ab-ink-60">{solution.headline}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
