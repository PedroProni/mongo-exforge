// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from '../components/ThemeToggle';
import { THEME_STORAGE_KEY } from '../constants/theme.constants';
import { readStoredTheme } from '../lib/theme';
import { installMemoryStorage } from './helpers/storage';
import { renderApp } from './helpers/render';

describe('theme', () => {
  let storage: ReturnType<typeof installMemoryStorage>;

  beforeEach(() => {
    storage = installMemoryStorage();
    document.documentElement.removeAttribute('data-theme');
  });
  afterEach(cleanup);

  it('defaults to dark and ignores invalid stored values', () => {
    expect(readStoredTheme()).toBe('dark');
    storage.setItem(THEME_STORAGE_KEY, 'neon');
    expect(readStoredTheme()).toBe('dark');
  });

  it('toggles, applies the attribute and remembers the choice', () => {
    renderApp(<ThemeToggle />);
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('light');
    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('starts from the remembered theme', () => {
    storage.setItem(THEME_STORAGE_KEY, 'light');
    expect(readStoredTheme()).toBe('light');
    renderApp(<ThemeToggle />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(screen.getByTestId('theme-toggle').getAttribute('aria-label')).toBe('Switch to dark theme');
  });
});
