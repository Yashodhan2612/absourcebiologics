import Image from "next/image";
import { Stat } from "@/components/ui/Stat";
import { clients } from "@/content/clients";
import { stats } from "@/content/stats";

/**
 * Client wall (Section 8, homepage section 11).
 *
 * clients.ts is empty because the live Clientele page was unreachable and no
 * logo may be shown that is not already published there. Section 16 bans a
 * "trusted by" bar built from invented marks, so when the array is empty this
 * renders the verified customer count alone and no logo grid at all.
 *
 * The country figure is deliberately absent. It is marked unverified in
 * stats.ts, and "5+ countries" sitting beside "300+ customers" reads badly —
 * the asymmetry undercuts the claim rather than supporting it.
 */
export function ClientWall() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-wrap items-end gap-16">
        <Stat entry={stats.customersServed} label="Customers served" />
        <p className="measure-ab text-[1.25rem] leading-[1.5] text-ab-ink-60">
          300+ customers across India and export markets, supplied from Pune since 2016.
        </p>
      </div>

      {clients.length > 0 ? (
        <ul className="grid grid-cols-2 items-center gap-x-12 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {clients.map((client) => (
            <li key={client.name}>
              <Image
                src={client.logo}
                alt={client.name}
                width={160}
                height={64}
                sizes="(max-width: 640px) 40vw, 160px"
                className="h-10 w-auto opacity-60 grayscale transition duration-150 ease-ab hover:opacity-100 hover:grayscale-0"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
