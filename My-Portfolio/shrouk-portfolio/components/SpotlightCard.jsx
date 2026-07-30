"use client";

import { useRef, useState } from "react";

export default function SpotlightCard({ children, className = "" }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      style={{
        "--x": `${pos.x}%`,
        "--y": `${pos.y}%`,
      }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-night-200/60 transition-colors hover:border-dawn-gold/30 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background:
            "radial-gradient(360px circle at var(--x) var(--y), rgba(255,193,94,0.12), transparent 65%)",
        }}
      />
      {children}
    </div>
  );
}