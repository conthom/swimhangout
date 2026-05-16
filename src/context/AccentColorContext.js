'use client';

import { createContext, useContext, useMemo } from 'react';
import {
  useAccentColor,
  ACCENT_PRIMARY,
  ACCENT_LIGHT,
} from '../hooks/useAccentColor';

const AccentColorContext = createContext({
  color: ACCENT_PRIMARY,
  hoverColor: ACCENT_LIGHT,
});

export function AccentColorProvider({ children }) {
  const color = useAccentColor();
  const value = useMemo(
    () => ({
      color,
      hoverColor: color === ACCENT_PRIMARY ? ACCENT_LIGHT : ACCENT_PRIMARY,
    }),
    [color]
  );

  return (
    <AccentColorContext.Provider value={value}>
      {children}
    </AccentColorContext.Provider>
  );
}

export function useThemeAccent() {
  return useContext(AccentColorContext);
}
