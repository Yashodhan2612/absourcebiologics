import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { solutions } from "@/content/solutions";

/**
 * 404. Every legacy WordPress URL 301s (see next.config.ts), so anyone landing
 * here has followed a genuinely broken link — give them the routes that
 * actually convert rather than a dead end.
 */
export default function NotFound() {
  return (
    <main className="container-ab flex min-h-screen flex-col justify-center py-24">
      <div className="max-w-3xl">
        <Eyebrow className="mb-6">404</Eyebrow>
        <h1 className="text-[2.75rem] leading-[0.95] tracking-[-0.03em] md:text-[3.75rem]">
          That page isn&rsquo;t here.
        </h1>
        <p className="measure-ab mt-6 text-[1.25rem] leading-[1.5] text-ab-ink-60">
          It may have moved when we rebuilt the site. Here is where most people are
          heading.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/culture-selector" size="lg">
            Find your culture
          </ButtonLink>
          <ButtonLink href="/products" variant="secondary" size="lg">
            See the catalogue
          </ButtonLink>
        </div>

        <div className="mt-14">
          <Eyebrow className="mb-4">Or start from what you&rsquo;re making</Eyebrow>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {solutions.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/solutions/${s.slug}`}
                  className="link-wipe text-[0.9375rem] text-ab-ink-60 no-underline"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
