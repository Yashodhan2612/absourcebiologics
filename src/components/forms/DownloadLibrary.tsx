"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { downloads, type DownloadDoc } from "@/content/downloads";
import { DownloadGate } from "./DownloadGate";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Document library with the email gate.
 *
 * Deep-linkable via ?doc=<slug> so a "Download the data sheet" button on a
 * product page opens straight onto that document's gate.
 */
export function DownloadLibrary() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<DownloadDoc | null>(
    () => downloads.find((d) => d.slug === searchParams.get("doc")) ?? null
  );

  const grouped = {
    tds: downloads.filter((d) => d.kind === "tds"),
    certificate: downloads.filter((d) => d.kind === "certificate"),
    brochure: downloads.filter((d) => d.kind === "brochure"),
  };

  return (
    <div className="grid gap-16 lg:grid-cols-[1fr_minmax(0,24rem)] lg:gap-24">
      <div className="flex flex-col gap-12">
        {(
          [
            ["tds", "Technical data sheets"],
            ["certificate", "Certification"],
            ["brochure", "Brochures"],
          ] as const
        ).map(([kind, label]) =>
          grouped[kind].length > 0 ? (
            <section key={kind}>
              <Eyebrow className="mb-5">{label}</Eyebrow>
              <ul className="divide-y divide-ab-chill border-y border-ab-chill">
                {grouped[kind].map((doc) => (
                  <li key={doc.slug} className="py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-[1.25rem] text-ab-ink">{doc.title}</h2>
                        <p className="measure-ab mt-1.5 text-[0.9375rem] text-ab-ink-60">
                          {doc.description}
                        </p>
                      </div>
                      <Button
                        variant={active?.slug === doc.slug ? "primary" : "quiet"}
                        onClick={() => setActive(doc)}
                      >
                        {active?.slug === doc.slug ? "Selected" : "Request"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null
        )}
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-ab-chill bg-ab-white p-6">
          {active ? (
            <>
              <Eyebrow className="mb-2">Requesting</Eyebrow>
              <h2 className="mb-6 text-[1.25rem] text-ab-ink">{active.title}</h2>
              <DownloadGate doc={active} />
            </>
          ) : (
            <p className="text-[0.9375rem] leading-[1.6] text-ab-ink-60">
              Choose a document and we&rsquo;ll prepare it. We ask for an email so a
              technologist can answer questions about what&rsquo;s in it &mdash; not to
              add you to a mailing list.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
