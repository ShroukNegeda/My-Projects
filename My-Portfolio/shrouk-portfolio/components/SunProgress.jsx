"use client";

import { motion } from "framer-motion";
import { useSectionProgress } from "@/lib/section-navigation";

export default function SunProgress() {
  const { progress } = useSectionProgress();
  const left = `${Math.max(0.5, Math.min(99.5, progress * 100))}%`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-white/5">
      <div className="absolute inset-0 bg-sunrise-gradient opacity-20" />
      <motion.div
        style={{ left }}
        className="absolute -top-[3px] h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-dawn-gold"
      />
    </div>
  );
}