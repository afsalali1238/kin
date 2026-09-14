'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Intake } from '@/lib/clinical';
import { initialRecovery, type Recovery } from '@/lib/app-types';
import { migrateRecovery, RECOVERY_ID_KEY, RECOVERY_STORAGE_KEY } from '@/lib/recovery-storage';
import { makeId } from '@/lib/id';

const SYNC_DEBOUNCE_MS = 900;

export type RestoredRecovery = { assessed: boolean };

/**
 * Owner of the single persisted recovery journey: localStorage is the source
 * of truth on this device, and every change is debounce-synced to
 * `/api/recovery` under an anonymous id. `sync` tells the UI whether the last
 * save reached the server ('synced') or only this device ('local').
 */
export function useRecovery(onRestored?: (restored: RestoredRecovery) => void, online = true) {
  const [state, setState] = useState<Recovery>(initialRecovery);
  const [ready, setReady] = useState(false);
  const [serverSync, setServerSync] = useState<'local' | 'synced'>('local');
  const sync: 'local' | 'synced' = online ? serverSync : 'local';
  const idRef = useRef('');
  const onRestoredRef = useRef(onRestored);
  useEffect(() => {
    onRestoredRef.current = onRestored;
  });

  // Load once after mount. Reading localStorage during render would break SSR
  // hydration, so the post-mount effect (and its setState) is intentional.
  useEffect(() => {
    let restored: Recovery = initialRecovery;
    let hasSaved = false;
    try {
      idRef.current = localStorage.getItem(RECOVERY_ID_KEY) || makeId();
      localStorage.setItem(RECOVERY_ID_KEY, idRef.current);
      const saved = localStorage.getItem(RECOVERY_STORAGE_KEY);
      if (saved) { restored = migrateRecovery(JSON.parse(saved)); hasSaved = true; }
      setState(restored); // eslint-disable-line react-hooks/set-state-in-effect -- hydrate persisted recovery after mount
    } catch {
      idRef.current = idRef.current || makeId();
    }
    setReady(true);
    if (restored.assessed) onRestoredRef.current?.({ assessed: true });
    if (online && idRef.current) {
      fetch(`/api/recovery?id=${encodeURIComponent(idRef.current)}`)
        .then(async (response) => {
          if (!response.ok) return;
          const payload = (await response.json()) as { state?: unknown };
          if (hasSaved || !payload.state) return;
          const remote = migrateRecovery(payload.state);
          setState(remote);
          if (remote.assessed) onRestoredRef.current?.({ assessed: true });
          setServerSync('synced');
        })
        .catch(() => undefined);
    }
  }, [online]);

  // Persist locally immediately, then debounce-sync to the server when online.
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(state));
    if (!online) return;
    const timer = setTimeout(() => {
      fetch('/api/recovery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idRef.current, state }),
      })
        .then((r) => setServerSync(r.ok ? 'synced' : 'local'))
        .catch(() => setServerSync('local'));
    }, SYNC_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state, ready, online]);

  const update = useCallback((patch: Partial<Recovery>) => setState((s) => ({ ...s, ...patch })), []);
  const answer = useCallback(
    (patch: Partial<Intake>) => setState((s) => ({ ...s, intake: { ...s.intake, ...patch } })),
    [],
  );

  return { state, update, answer, ready, sync, idRef };
}
