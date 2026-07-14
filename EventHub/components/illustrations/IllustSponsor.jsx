'use client';
import { C } from "../constants/styles";

export function IllustSponsor() {
  return (
    <svg width="380" height="300" viewBox="0 0 380 300">
      <ellipse cx="220" cy="265" rx="140" ry="18" fill="#d1d9f0" opacity="0.4" />
      <circle cx="160" cy="160" r="10" fill={C.orange} opacity="0.3" />
      <circle cx="300" cy="100" r="8" fill={C.orange} opacity="0.3" />
      <circle cx="80" cy="200" r="6" fill={C.orange} opacity="0.3" />
      <circle cx="340" cy="200" r="14" fill={C.orange} opacity="0.2" />
      <rect x="120" y="80" width="80" height="180" rx="10" fill="#c7d2f5" />
      <rect x="210" y="80" width="80" height="180" rx="10" fill="#dde2f5" />
      <circle cx="160" cy="110" r="18" fill={C.navy} opacity="0.3" />
      <rect x="130" y="140" width="60" height="8" rx="4" fill={C.navy} opacity="0.2" />
      <circle cx="250" cy="110" r="18" fill={C.navy} opacity="0.3" />
      <path d="M200 200 Q250 170 310 190" stroke={C.orange} strokeWidth="2" fill="none" />
      <circle cx="310" cy="190" r="6" fill={C.orange} />
      <path d="M120 230 Q160 210 200 220" stroke="#6b7280" strokeWidth="2" fill="none" />
    </svg>
  );
}