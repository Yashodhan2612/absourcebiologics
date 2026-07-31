import Link from "next/link";
import { footerNav, legalNav } from "@/content/nav";
import { company, positioning } from "@/content/company";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ab-reversed border-t border-ab-chill bg-ab-tank text-ab-milk">
      <div className="container-ab py-20">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <Logo tone="reversed" className="h-11" />
            <p className="max-w-xs text-[0.9375rem] leading-[1.6] text-ab-tank-300">
              {positioning.claim}
            </p>
            <address className="not-italic text-[0.9375rem] leading-[1.7] text-ab-tank-300">
              {company.legalName}
              <br />
              {company.address.line1}
              <br />
              {company.address.line2}
              <br />
              {company.address.city} &ndash; {company.address.postcode}, {company.address.country}
            </address>
            <div className="flex flex-col gap-1 text-[0.9375rem]">
              <a
                href={`mailto:${company.email}`}
                className="link-wipe self-start text-ab-milk no-underline"
              >
                {company.email}
              </a>
              {company.phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="link-wipe self-start text-ab-tank-300 no-underline"
                >
                  {phone}
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h2 className="mono-ab mb-4 text-ab-tank-300">{group.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="link-wipe text-[0.9375rem] text-ab-milk no-underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ab-milk/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono-ab text-ab-tank-300">
            &copy; {year} {company.legalName} &middot; A {company.group} group company
          </p>
          <ul className="flex gap-6">
            {legalNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-wipe mono-ab text-ab-tank-300 no-underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
