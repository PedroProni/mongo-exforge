import { describe, expect, it } from 'vitest';
import en from '../i18n/en.json';
import pt from '../i18n/pt.json';
import { createTranslate } from '../i18n/translate';

const REQUIRED_KEYS = [
  'app.title',
  'jobs.status.pending',
  'jobs.status.in_progress',
  'jobs.status.completed',
  'jobs.status.failed',
  'jobs.status.expired',
  'operator.eq',
  'operator.nin',
  'sort.asc',
  'sort.desc',
  'new.submit',
  'jobs.downloadFailed',
  'nav.dashboard',
  'nav.templates',
  'nav.openMenu',
  'nav.closeMenu',
  'theme.toLight',
  'theme.toDark',
  'dashboard.title',
  'dashboard.window',
  'dashboard.successRate',
  'dashboard.chartLabel',
  'jobs.search',
  'jobs.statusFilter',
  'jobs.details',
  'jobs.fileSize',
  'jobs.duration',
  'jobs.rerun',
  'jobs.saveTemplate',
  'preview.title',
  'preview.run',
  'preview.estimate',
  'preview.estimateCapped',
  'preview.pickColumns',
  'templates.title',
  'templates.run',
  'templates.rename',
  'templates.saved',
];

describe('i18n parity', () => {
  it('has the same keys in both languages', () => {
    expect(Object.keys(pt).sort()).toEqual(Object.keys(en).sort());
  });

  it('has every required key with text in both languages', () => {
    for (const key of REQUIRED_KEYS) {
      expect((en as Record<string, string>)[key]).toBeTruthy();
      expect((pt as Record<string, string>)[key]).toBeTruthy();
    }
  });

  it('keeps the same placeholders in both languages', () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(en)) expect(placeholders((pt as Record<string, string>)[key])).toEqual(placeholders((en as Record<string, string>)[key]));
  });

  it('never uses the em dash', () => {
    expect(JSON.stringify(en) + JSON.stringify(pt)).not.toContain(String.fromCharCode(8212));
  });

  it('has a translation for every key used by t() calls', () => {
    const sources = import.meta.glob('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const used = new Set<string>();
    for (const [path, source] of Object.entries(sources)) {
      if (path.includes('__tests__')) continue;
      for (const match of source.matchAll(/\bt\('([\w.]+)'/g)) used.add(match[1]);
    }
    for (const key of used) {
      expect((en as Record<string, string>)[key], key).toBeTruthy();
      expect((pt as Record<string, string>)[key], key).toBeTruthy();
    }
  });

  it('interpolates values and falls back to the key', () => {
    const t = createTranslate({ a: 'Page {page}' });
    expect(t('a', { page: 2 })).toBe('Page 2');
    expect(t('missing')).toBe('missing');
  });
});
