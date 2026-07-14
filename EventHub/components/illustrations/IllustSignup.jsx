'use client';
import { C } from "../constants/styles";

export default function IllustSignup() {
  return (
    <svg width="340" height="300" viewBox="0 0 340 300">
      <ellipse cx="200" cy="265" rx="130" ry="18" fill="#d1d9f0" opacity="0.4" />
      <rect x="190" y="80" width="120" height="160" rx="12" fill="#c7d2f5" opacity="0.6" />
      <circle cx="190" cy="80" r="40" fill="#d1d9f0" />
      <circle cx="190" cy="68" r="18" fill={C.navy} opacity="0.4" />
      <rect x="160" y="100" width="60" height="80" rx="6" fill={C.navy} opacity="0.15" />
      <rect x="240" y="100" width="80" height="160" rx="12" fill="#e8ecf8" />
      <circle cx="260" cy="130" r="18" fill={C.navy} opacity="0.3" />
      <rect x="245" y="160" width="60" height="8" rx="4" fill={C.navy} opacity="0.2" />
      <rect x="250" y="175" width="50" height="8" rx="4" fill={C.navy} opacity="0.2" />
    </svg>
  );
}
