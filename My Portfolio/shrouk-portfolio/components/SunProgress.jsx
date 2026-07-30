"use client";

import { useScroll, useTransform, motion } from "framer-motion";

export default function SunProgress() {
  const { scrollYProgress } = useScroll();
  const left = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const glow = useTransform(
    scrollYProgress,
    [0, 1],
    ["0 0 12px 2px rgba(184,76,46,0.7)", "0 0 16px 4px rgba(255,193,94,0.9)"]
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-white/5">
      <div className="absolute inset-0 bg-sunrise-gradient opacity-20" />
      <motion.div
        style={{ left, boxShadow: glow }}
        className="absolute -top-[3px] h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-dawn-gold"
      />
    </div>
  );
}