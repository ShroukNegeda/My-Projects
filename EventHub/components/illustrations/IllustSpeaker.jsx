'use client';
import { C } from "../constants/styles";

export default function IllustSpeaker() {
  return (
    <svg width="380" height="320" viewBox="0 0 380 320">
      <ellipse cx="220" cy="280" rx="140" ry="18" fill="#d1d9f0" opacity="0.4" />
      <rect x="60" y="60" width="200" height="30" rx="4" fill="#e8e8e8" opacity="0.6" />
      <text x="90" y="81" fontSize="14" fill="#999" fontFamily="sans-serif">CONFERENCE</text>
      <rect x="220" y="60" width="150" height="220" rx="10" fill="#c7d2f5" opacity="0.7" />
      <rect x="230" y="120" width="30" height="80" rx="4" fill={C.navy} opacity="0.3" />
      <circle cx="270" cy="90" r="22" fill="#d1d9f0" />
      <path d="M255 280 Q270 240 285 280" fill={C.navy} opacity="0.3" />
      <rect x="310" y="150" width="50" height="80" rx="6" fill="#e0e8f8" />
      <rect x="80" y="180" width="140" height="80" rx="8" fill="#d1d9f0" opacity="0.5" />
      <circle cx="110" cy="210" r="16" fill={C.navy} opacity="0.2" />
      <circle cx="160" cy="210" r="16" fill={C.navy} opacity="0.2" />
      <circle cx="210" cy="210" r="16" fill={C.navy} opacity="0.2" />
    </svg>
  );
}
