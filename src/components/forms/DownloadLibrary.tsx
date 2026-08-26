"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { downloads, type DownloadDoc } from "@/content/downloads";
import { DownloadGate } from "./DownloadGate";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Document library with the email gate.
 *
 * Deep-linkable via ?doc=<slug> so a "Request the data sheet" button on a
 * product page opens straight onto that document's gate.
 */
export function DownloadLibrary() {
  const searchParams = useSearchParams();
  // Held here, not in the gate, because the gate is remounted on every
  // document switch (see the key below). If it owned this, each switch would
  // reset the clock and re-arm the two-second MIN_SUBMIT_MS window — so a
  // buyer whose browser autofills the form and submits straight away would be
  // treated as a bot: the route returns 200 with no document and no lead, and
  // the panel would say "Request received." for a request that was dropped.
  const startedAt = useRef(Date.now());
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

      {/* Not sticky. The panel is seven fields tall, and a sticky box taller
          than the viewport pins its own submit button off screen. */}
      <aside className="lg:self-start">
        <div className="border border-ab-chill bg-ab-white p-6">
          {active ? (
            <>
              <Eyebrow className="mb-2">Requesting</Eyebrow>
              <h2 className="mb-6 text-[1.25rem] text-ab-ink">{active.title}</h2>
              {/* Keyed so switching documents remounts the gate. Without it
                  React reuses the instance and every piece of its state
                  survives — including the terminal "Request received." panel,
                  which now returns early before the form. Since every document
                  is release: "on-approval", that panel is the outcome of every
                  successful request, so the second data sheet could never be
                  requested: the heading swapped, the body did not, and the
                  buyer read a confirmation for a request never sent. */}
              <DownloadGate key={active.slug} doc={active} startedAt={startedAt.current} />
            </>
          ) : (
            <p className="text-[0.9375rem] leading-[1.6] text-ab-ink-60">
              Choose a document and tell us who you are. Data sheets carry
              composition, dosage and incubation parameters, so we confirm the
              dairy before we send one &mdash; not to add you to a mailing list.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
