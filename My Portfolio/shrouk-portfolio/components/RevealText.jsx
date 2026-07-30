"use client";

import { motion } from "framer-motion";

export default function RevealText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 0.045,
}) {
  const words = text.split(" ");

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const child = {
    hidden: { y: "110%", opacity: 0 },
    show: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <Tag className={className}>
      <motion.span variants={container} initial="hidden" animate="show" className="inline-block">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom pb-1">
            <motion.span variants={child} className="inline-block">
              {word}
              {i !== words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}