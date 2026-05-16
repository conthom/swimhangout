'use client';

import { useEffect, useState } from 'react';

export const ACCENT_PRIMARY = '#1d4ed8';
export const ACCENT_LIGHT = '#4da8e8';

export function useAccentColor() {
  const [usePrimaryBlue, setUsePrimaryBlue] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsePrimaryBlue((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return usePrimaryBlue ? ACCENT_PRIMARY : ACCENT_LIGHT;
}
