import { describe, expect, it } from 'vitest';
import { buildJobInput, parseValue, splitList } from '../lib/job-input';
import { JobDraft } from '../types/form.types';

const DRAFT: JobDraft = { name: 'Adults', export_format: 'csv', source: 'saved', connection_id: 'c1', uri: '', collection: 'users', filters: [], fields: '', sort_field: '', sort_direction: 'asc', max_rows: '' };

describe('parseValue', () => {
  it('parses numbers, booleans and strings', () => {
    expect(parseValue('18', 'gte')).toBe(18);
    expect(parseValue('true', 'eq')).toBe(true);
    expect(parseValue('abc', 'eq')).toBe('abc');
  });

  it('splits lists for in and nin', () => {
    expect(parseValue('1, a ,true', 'in')).toEqual([1, 'a', true]);
  });
});

describe('splitList', () => {
  it('drops empty entries', () => {
    expect(splitList('a, ,b,')).toEqual(['a', 'b']);
  });
});

describe('buildJobInput', () => {
  it('matches every document when no filter is given', () => {
    expect(buildJobInput(DRAFT).query).toEqual([{ connection_id: 'c1', collection: 'users', field: '_id', operator: 'ne', value: null }]);
  });

  it('uses the uri source and optional fields', () => {
    const input = buildJobInput({ ...DRAFT, source: 'uri', uri: 'mongodb://h/db', filters: [{ field: 'age', operator: 'gte', value: '18' }], fields: 'name,age', sort_field: 'age', sort_direction: 'desc', max_rows: '50' });
    expect(input.query).toEqual([{ uri: 'mongodb://h/db', collection: 'users', field: 'age', operator: 'gte', value: 18 }]);
    expect(input.fields).toEqual(['name', 'age']);
    expect(input.sort).toEqual({ age: 'desc' });
    expect(input.max_rows).toBe(50);
  });
});
