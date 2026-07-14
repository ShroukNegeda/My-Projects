'use client';

import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import {
  subscribeApiDepth,
  getApiDepthSnapshot,
  getApiDepthServerSnapshot,
} from '@/lip/apiFetchTrack';

const WRAPPER_STYLE = {
  position: 'fixed',
  inset: 0,
  zIndex: 900,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(248, 249, 251, 0.75)',
  backdropFilter: 'blur(4px)',
  fontFamily: 'Poppins, sans-serif',
};

export default function GlobalApiLoadingOverlay() {
  const pathname = usePathname();
  const depth = useSyncExternalStore(
    subscribeApiDepth,
    getApiDepthSnapshot,
    getApiDepthServerSnapshot,
  );

  if (pathname === '/admin-dashboard') return null;

  if (depth <= 0) return null;

  return (
    <>
      <div
        style={WRAPPER_STYLE}
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading"
      >
        <FaSpinner size={40} color="#f97316" style={{ animation: 'eh-spin-global 1s linear infinite' }} />
      </div>
      <style>{`
        @keyframes eh-spin-global {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
