"use client";

import { motion } from "framer-motion";

export default function FadeIn({
  children,
  className = "",
  delay = 0,
  y = 24,
  duration = 0.6,
}) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}