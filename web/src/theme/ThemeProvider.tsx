import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applyTheme, nextTheme, readStoredTheme } from '../lib/theme';
import { Theme, ThemeContextValue } from '../types/theme.types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(current => {
      const next = nextTheme(current);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('ThemeProvider missing');
  return value;
}
