import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, LANGUAGES } from '../constants/app.constants';
import { I18nContextValue } from '../types/context.types';
import { Language } from '../types/app.types';
import { CATALOGS } from './catalogs.constants';
import { createTranslate } from './translate';

const I18nContext = createContext<I18nContextValue | null>(null);

function initialLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && (LANGUAGES as readonly string[]).includes(stored)) return stored as Language;
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      t: createTranslate(CATALOGS[language]),
      setLanguage: next => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
        setLanguageState(next);
      },
    }),
    [language],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('I18nProvider missing');
  return value;
}
