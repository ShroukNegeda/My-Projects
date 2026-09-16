"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { useLanguage } from "@/context/language-context";

const serviceHrefs = ["web-development", "mobile-development", "ui-ux-design", "seo", "digital-growth"];

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="container-page grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-muted">
            {t.footer.tagline}
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            {t.footer.navigate}
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-text-muted">
            <li><Link href="/about" className="hover:text-text">{t.nav.about}</Link></li>
            <li><Link href="/portfolio" className="hover:text-text">{t.nav.portfolio}</Link></li>
            <li><Link href="/services" className="hover:text-text">{t.nav.services}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            {t.footer.services}
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-text-muted">
            {t.footer.services_list.map((service, i) => (
              <li key={service}>
                <Link href={`/services#${serviceHrefs[i]}`} className="hover:text-text">
                  {service}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            {t.footer.contact}
          </h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li><a href="https://wa.me/201271705556" target="_blank" rel="noreferrer" className="text-accent hover:opacity-80">WhatsApp</a></li>
            <li><a href="https://www.facebook.com/Kaalextech" target="_blank" rel="noreferrer" className="text-accent hover:opacity-80">Facebook</a></li>
            <li><a href="https://www.instagram.com/kaalextech?stkn=MXFub3UwM2xhZ3o2eA==" target="_blank" rel="noreferrer" className="text-accent hover:opacity-80">Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col gap-2 border-t border-border py-6 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} {t.footer.rights}</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-text-muted">{t.footer.privacy}</a>
          <a href="#" className="hover:text-text-muted">{t.footer.terms}</a>
        </div>
      </div>
    </footer>
  );
}
