import { describe, expect, it } from 'vitest';
import { buildBars } from '../lib/chart';
import { formatBytes, formatCell, formatDuration, formatPercent } from '../lib/format';
import { jobProgress } from '../lib/progress';
import { directionOf, sortEntries } from '../lib/sort';
import { templateToDraft } from '../lib/template-draft';
import { buildPreviewInput, toggleField } from '../lib/job-input';
import { INITIAL_DRAFT } from '../constants/job-form.constants';
import { TEMPLATE } from './helpers/fixtures';

describe('formatBytes', () => {
  it('scales units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('formatDuration', () => {
  it('formats durations and missing values', () => {
    expect(formatDuration('2026-11-10T10:00:00.000Z', '2026-11-10T10:00:00.400Z')).toBe('400 ms');
    expect(formatDuration('2026-11-10T10:00:00.000Z', '2026-11-10T10:00:12.000Z')).toBe('12 s');
    expect(formatDuration('2026-11-10T10:00:00.000Z', '2026-11-10T10:02:05.000Z')).toBe('2 min 5 s');
    expect(formatDuration(null, null)).toBe('-');
  });
});

describe('formatPercent and formatCell', () => {
  it('formats rates and truncates cells', () => {
    expect(formatPercent(0.9)).toBe('90%');
    expect(formatPercent(null)).toBe('-');
    expect(formatCell({ a: 1 }, 80)).toBe('{"a":1}');
    expect(formatCell('x'.repeat(10), 4)).toBe('xxxx...');
    expect(formatCell(null, 4)).toBe('');
  });
});

describe('jobProgress', () => {
  it('maps status and row counts to a percentage', () => {
    expect(jobProgress({ status: 'completed', rows_exported: 5, max_rows: null })).toBe(100);
    expect(jobProgress({ status: 'pending', rows_exported: 0, max_rows: null })).toBe(0);
    expect(jobProgress({ status: 'in_progress', rows_exported: 50, max_rows: 100 })).toBe(50);
    expect(jobProgress({ status: 'in_progress', rows_exported: 500, max_rows: 100 })).toBe(99);
    expect(jobProgress({ status: 'in_progress', rows_exported: 50, max_rows: null })).toBeNull();
  });
});

describe('buildBars', () => {
  it('scales bars to the highest day', () => {
    const bars = buildBars([
      { date: 'a', count: 0 },
      { date: 'b', count: 5 },
      { date: 'c', count: 10 },
    ]);
    expect(bars[0].height).toBe(0);
    expect(bars[2].height).toBeGreaterThan(bars[1].height);
    expect(buildBars([])).toEqual([]);
  });
});

describe('sort helpers', () => {
  it('reads numeric and textual directions', () => {
    expect(directionOf(-1)).toBe('desc');
    expect(directionOf(1)).toBe('asc');
    expect(directionOf('desc')).toBe('desc');
    expect(sortEntries({ age: -1 })).toEqual([{ field: 'age', direction: 'desc' }]);
  });
});

describe('template and preview inputs', () => {
  it('turns a template back into a draft', () => {
    const draft = templateToDraft(TEMPLATE);
    expect(draft).toMatchObject({
      name: 'Weekly adults',
      source: 'saved',
      connection_id: 'c1',
      collection: 'users',
      export_format: 'json',
      fields: 'name',
      sort_field: 'age',
      sort_direction: 'asc',
      max_rows: '500',
    });
    expect(draft.filters).toEqual([{ field: 'age', operator: 'gte', value: '18' }]);
  });

  it('drops the match-all filter when rebuilding a draft', () => {
    const template = { ...TEMPLATE, query: [{ connection_id: 'c1', collection: 'users', field: '_id', operator: 'ne' as const, value: null }] };
    expect(templateToDraft(template).filters).toEqual([]);
  });

  it('builds a preview without the field selection', () => {
    const input = buildPreviewInput({ ...INITIAL_DRAFT, connection_id: 'c1', collection: 'users', fields: 'name', sort_field: 'age' });
    expect(input).toEqual({ query: [{ connection_id: 'c1', collection: 'users', field: '_id', operator: 'ne', value: null }], sort: { age: 'asc' } });
  });

  it('toggles selected fields', () => {
    expect(toggleField('', 'name')).toBe('name');
    expect(toggleField('name', 'age')).toBe('name, age');
    expect(toggleField('name, age', 'name')).toBe('age');
  });
});
