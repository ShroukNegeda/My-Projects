"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import { Logo } from "./logo";
import { Button } from "./button";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "@/context/language-context";

export function Header() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const projectHref = pathname === "/" ? "#start-project" : "/#start-project";

  const handleProjectClick = () => {
    setOpen(false);

    if (pathname === "/") {
      requestAnimationFrame(() => {
        document.getElementById("start-project")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  };

  const handleLogoClick = () => {
    setOpen(false);

    if (pathname === "/") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  };

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/services", label: t.nav.services },
    { href: "/portfolio", label: t.nav.portfolio },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="container-page flex h-18 items-center justify-between py-3.5">
        <Link href="/" onClick={handleLogoClick} className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm font-medium transition-colors",
                  active ? "text-accent" : "text-text-muted hover:text-text"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text transition-colors hover:border-text-faint"
          >
            <Search size={15} />
          </button>
          <Button
            href={projectHref}
            onClick={handleProjectClick}
            size="md"
            icon={<ArrowRight size={15} />}
          >
            {t.nav.startProject}
          </Button>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text lg:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-bg px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "text-base font-medium",
                  pathname === link.href ? "text-accent" : "text-text"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <Button
            href={projectHref}
            onClick={handleProjectClick}
            className="mt-5 w-full"
            icon={<ArrowRight size={15} />}
          >
            {t.nav.startProject}
          </Button>
        </div>
      )}
    </header>
  );
}
