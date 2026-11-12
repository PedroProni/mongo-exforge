import { THEMES } from '../constants/theme.constants';

export type Theme = (typeof THEMES)[number];
export type ThemeContextValue = { theme: Theme; toggleTheme: () => void };
