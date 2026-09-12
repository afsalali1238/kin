'use client';
import { useSyncExternalStore } from 'react';

/**
 * Live connectivity status, hydration-safe: the server snapshot assumes
 * online (the fetch cache works identically), and the store flips to the real
 * value on the client without an effect or a manual setState.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener('online', notify);
      window.addEventListener('offline', notify);
      return () => {
        window.removeEventListener('online', notify);
        window.removeEventListener('offline', notify);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}
