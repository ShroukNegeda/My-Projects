"use client";

import { useLanguage } from "@/context/language-context";
import { EmptyPage } from "@/components/shared/empty-page";

export default function ServicesPage() {
  const { t } = useLanguage();
  return (
    <EmptyPage
      title={t.placeholder.services.title}
      desc={t.placeholder.services.desc}
    />
  );
}
