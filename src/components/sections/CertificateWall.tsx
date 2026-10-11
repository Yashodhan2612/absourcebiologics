import Image from "next/image";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  certifications,
  fssai,
  formatLicenceDate,
} from "@/content/certifications";

/**
 * The trust wall: the FSSAI licence, then the certificate scans.
 *
 * Why the licence leads. It is the only document here whose number a buyer can
 * check independently, on a public register, in under a minute — and its scope
 * line names Manufacturer and Exporter, which is the registry's own
 * corroboration of the two things this company says about itself. A scan of a
 * certificate asks to be believed; a licence number can be verified.
 *
 * The PDF opens in a new tab rather than downloading or going through the
 * gated document route. An auditor asked to fill in a form before seeing a
 * licence number assumes there is a reason.
 *
 * Used once, on /quality. It used to have a compact variant for a slot on
 * /why-absource; that was removed when the client asked that no image repeat
 * anywhere on the site, and that page now links here instead.
 */
export function CertificateWall() {
  return (
    <div className="flex flex-col gap-14">
      {/* ---------------------------------------------------- FSSAI licence */}
      <div className="border border-ab-chill bg-ab-white p-8 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
          <div>
            <Eyebrow className="mb-5">FSSAI licence</Eyebrow>
            <p className="font-display text-[2rem] leading-[1] tracking-[-0.02em] text-ab-ink md:text-[2.5rem]">
              {fssai.licenceNumber}
            </p>
            <p className="mono-ab mt-3 text-ab-ink-60">
              {fssai.category} &middot; valid to{" "}
              {formatLicenceDate(fssai.validUpto)}
            </p>
            <p className="measure-ab mt-6 text-[0.9375rem] leading-[1.65] text-ab-ink-60">
              {fssai.what}
            </p>

            <ul className="mt-6 flex flex-col gap-1.5">
              {fssai.scope.map((line) => (
                <li key={line} className="mono-ab text-[0.8125rem] text-ab-ink-60">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={fssai.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-fit shrink-0 items-center rounded-ab border border-ab-tank px-5 text-[0.9375rem] text-ab-tank no-underline transition-colors duration-150 ease-ab hover:bg-ab-tank hover:text-ab-milk"
          >
            View the licence (PDF)
            {/* Opening in a new tab is announced, not left to the icon. */}
            <span className="sr-only"> — opens in a new tab</span>
          </a>
        </div>
      </div>

      {/* ----------------------------------------------- certificate scans */}
      <div>
        <Eyebrow className="mb-6">Certifications</Eyebrow>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map((cert) => (
            <li key={cert.slug} className="flex flex-col">
              {/*
                The scan itself, on a white card with a rule — a certificate is
                a document, and floating it on the page ground reads as a
                graphic. object-contain because these are portrait scans and
                cropping one cuts the accreditation marks off the bottom, which
                are the part an auditor looks for.

                It opens full size. The certificate number, scope and expiry
                cannot be read at card size, and those are what someone opens a
                certificate to check. A plain link to the file: no lightbox to
                build, focus or trap.
              */}
              <a
                href={cert.image}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-[3/4] overflow-hidden border border-ab-chill bg-ab-white transition-colors duration-150 ease-ab hover:border-ab-tank"
              >
                <Image
                  src={cert.image}
                  alt={`${cert.name} certificate issued to ABsource Biologics`}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="object-contain p-2"
                />
                <span className="sr-only"> — opens full size in a new tab</span>
              </a>

              <p className="mono-ab mt-3 text-ab-ink">{cert.name}</p>
              <p className="mono-ab text-[0.8125rem] text-ab-ink-60">
                {cert.standard}
              </p>
              <p className="mt-2 text-[0.875rem] leading-[1.55] text-ab-ink-60">
                {cert.what}
              </p>
            </li>
          ))}
        </ul>

        <p className="mono-ab mt-6 text-[0.8125rem] text-ab-ink-60">
          Select a certificate to read it full size.
        </p>
      </div>
    </div>
  );
}
