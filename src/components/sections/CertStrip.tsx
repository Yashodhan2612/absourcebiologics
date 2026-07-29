import Link from "next/link";
import { certifications, qualityClaims } from "@/content/certifications";

/**
 * Quality band (Section 8, homepage section 10).
 *
 * Certificate marks could not be fetched in this environment, so each
 * certification is set typographically rather than as an image placeholder.
 * That is the honest treatment — a grey box labelled "ISO 9001" would be worse
 * than the words themselves. /quality shows the certificates at readable size
 * once the images land.
 */
export function CertStrip() {
  return (
    <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-24">
      <ul className="grid grid-cols-2 gap-px border border-ab-chill bg-ab-chill">
        {certifications.map((cert) => (
          <li key={cert.slug} className="bg-ab-white p-6">
            <p className="font-display text-[1.25rem] leading-tight tracking-[-0.02em] text-ab-tank">
              {cert.name}
            </p>
            <p className="mono-ab mt-2 text-ab-ink-60">{cert.standard}</p>
          </li>
        ))}
      </ul>

      <ul className="flex flex-col divide-y divide-ab-chill border-y border-ab-chill">
        {qualityClaims.map((claim) => (
          <li key={claim.title} className="py-5">
            <h3 className="text-[1.25rem] text-ab-ink">{claim.title}</h3>
            <p className="measure-ab mt-1.5 text-[0.9375rem] leading-[1.55] text-ab-ink-60">
              {claim.body}
            </p>
          </li>
        ))}
        <li className="py-5">
          <Link href="/quality" className="link-wipe mono-ab text-ab-tank no-underline">
            How we verify quality &rarr;
          </Link>
        </li>
      </ul>
    </div>
  );
}
