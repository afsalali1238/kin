'use client';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    if (mq.matches || Boolean((navigator as unknown as { standalone?: boolean }).standalone)) {
      setIsInstalled(true); // eslint-disable-line react-hooks/set-state-in-effect -- hydrate standalone mode client-side
    }
    const fn = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener('change', fn);

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      mq.removeEventListener('change', fn);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    return choice.outcome === 'accepted';
  };

  return { canInstall: !!promptEvent && !isInstalled, isInstalled, install };
}
