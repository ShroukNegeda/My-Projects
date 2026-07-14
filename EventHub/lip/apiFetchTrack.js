'use client';

import { getToken, matchesTrackedBackendFetch } from '@/lip/api';

function initHasAuthHeader(init) {
  if (!init || !init.headers) return false;
  const h = init.headers;
  if (typeof h.get === 'function') {
    return !!h.get('authorization') || !!h.get('Authorization');
  }
  if (Array.isArray(h)) {
    return h.some(
      (pair) =>
        Array.isArray(pair) &&
        String(pair[0]).toLowerCase() === 'authorization' &&
        pair[1],
    );
  }
  return Object.keys(h).some(
    (k) => k.toLowerCase() === 'authorization' && h[k],
  );
}

let apiDepth = 0;
const listeners = new Set();

export function subscribeApiDepth(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getApiDepthSnapshot() {
  return apiDepth;
}

export function getApiDepthServerSnapshot() {
  return 0;
}

function bumpApiDepth(delta) {
  apiDepth = Math.max(0, apiDepth + delta);
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined' && !globalThis.__EH_FETCH_LOAD_TRACK__) {
  globalThis.__EH_FETCH_LOAD_TRACK__ = true;
  const origFetch = window.fetch.bind(window);

  window.fetch = async function trackedFetch(input, init) {
    const track = matchesTrackedBackendFetch(input);
    if (track) bumpApiDepth(1);
    try {
      if (track) {
        try {
          const method = (init?.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
          const url = typeof input === 'string' ? input : input?.url;
          const hasAuthHeader = initHasAuthHeader(init);
          const hasStoredToken = !!getToken();
          console.log('[EH fetch]', method, url, { hasAuthHeader, hasStoredToken });
        } catch {}
      }
      return await origFetch(input, init);
    } finally {
      if (track) bumpApiDepth(-1);
    }
  };
}
