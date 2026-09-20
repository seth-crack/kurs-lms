import { useEffect } from 'react';
import { useAuth } from '../store/useAuth';

export function useThemeSync() {
  const theme = useAuth((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    const apply = () => {
      if (theme === 'auto') {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', dark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', theme);
      }
    };

    apply();

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}