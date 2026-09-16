"use client";

import { useLanguage } from "@/context/language-context";

export function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label="Toggle language"
      className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-text transition-colors hover:border-text-faint"
    >
      <span className={locale === "en" ? "text-accent" : "text-text-faint"}>EN</span>
      <span className="text-text-faint">/</span>
      <span className={locale === "ar" ? "text-accent" : "text-text-faint"}>AR</span>
    </button>
  );
}
