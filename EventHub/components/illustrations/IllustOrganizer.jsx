'use client';
import { C } from "../constants/styles";

export function IllustOrganizer() {
  return (
    <svg width="380" height="300" viewBox="0 0 380 300">
      <ellipse cx="200" cy="265" rx="140" ry="18" fill="#d1d9f0" opacity="0.4" />
      <rect x="100" y="60" width="220" height="180" rx="14" fill="#c7d2f5" opacity="0.5" />
      <rect x="115" y="75" width="190" height="150" rx="10" fill={C.white} opacity="0.8" />
      <circle cx="350" cy="60" r="26" fill="#d1d9f0" />
      <path d="M330 220 L360 220 L360 160 L330 160 Z" fill={C.navy} opacity="0.2" />
      <rect x="130" y="100" width="160" height="10" rx="5" fill={C.navy} opacity="0.15" />
      <rect x="130" y="118" width="120" height="8" rx="4" fill={C.navy} opacity="0.1" />
      <rect x="130" y="134" width="140" height="8" rx="4" fill={C.navy} opacity="0.1" />
      <circle cx="230" cy="80" r="20" fill="#d1d9f0" />
    </svg>
  );
}
