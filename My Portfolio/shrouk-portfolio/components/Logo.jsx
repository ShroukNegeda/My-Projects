"use client";

import { motion } from "framer-motion";

export default function Logo({ className = "" }) {
  return (
    <motion.svg whileHover={{ scale: 1.06 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} width="50" height="50" viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="navLogoGradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#B84C2E" />
          <stop offset="55%" stopColor="#FF7A52" />
          <stop offset="100%" stopColor="#FFC15E" />
        </linearGradient>
      </defs>

      <text x="32" y="41" textAnchor="middle" fontFamily="var(--font-fraunces), Georgia, serif" fontSize="26" fontWeight="700" fill="url(#navLogoGradient)">
        SN
      </text>
    </motion.svg>
  );
}