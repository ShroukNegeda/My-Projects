'use client';
import { C } from "../constants/styles";

export default function IllustLogin() {
  return (
    <svg width="340" height="300" viewBox="0 0 340 300">
      <ellipse cx="170" cy="260" rx="140" ry="20" fill="#d1d9f0" opacity="0.4" />
      <rect x="80" y="60" width="200" height="160" rx="12" fill="#c7d2f5" opacity="0.5" />
      <rect x="100" y="80" width="160" height="120" rx="8" fill={C.white} />
      <rect x="220" y="40" width="100" height="80" rx="10" fill={C.navy} opacity="0.8" />
      <rect x="230" y="55" width="80" height="8" rx="4" fill={C.white} opacity="0.6" />
      <rect x="230" y="70" width="60" height="8" rx="4" fill={C.white} opacity="0.6" />
      <rect x="230" y="85" width="70" height="8" rx="4" fill={C.white} opacity="0.6" />
      <circle cx="145" cy="150" r="28" fill="#d1d9f0" />
      <circle cx="145" cy="140" r="14" fill={C.navy} opacity="0.5" />
      <path d="M110 185 Q145 165 180 185" fill={C.navy} opacity="0.3" />
    </svg>
  );
}
