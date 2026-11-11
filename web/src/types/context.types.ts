import { Language, TranslateFn } from './app.types';
import { User } from './api.types';

export type I18nContextValue = { language: Language; t: TranslateFn; setLanguage: (language: Language) => void };
export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
  refresh: () => Promise<void>;
};
export type ToastContextValue = { notify: (message: string, kind?: 'ok' | 'error') => void };
