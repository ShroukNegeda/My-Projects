"use client";

import { useLanguage } from "@/context/language-context";
import { Team } from "../shared/team";

export function TeamSection() {
  const { t } = useLanguage();
  return <Team title={t.home.team.title} members={t.home.team.members} />;
}
