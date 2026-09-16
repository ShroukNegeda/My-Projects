"use client";

import { useLanguage } from "@/context/language-context";
import { EmptyPage } from "@/components/shared/empty-page";

export default function PortfolioPage() {
  const { t } = useLanguage();
  return (
    <EmptyPage
      title={t.placeholder.portfolio.title}
      desc={t.placeholder.portfolio.desc}
    />
  );
}
