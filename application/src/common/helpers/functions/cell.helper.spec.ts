import { CellHelper } from '@common/helpers/functions/cell.helper';

describe('CellHelper', () => {
  describe('getPath', () => {
    it('reads nested values', () => {
      expect(CellHelper.getPath({ a: { b: { c: 3 } } }, 'a.b.c')).toBe(3);
    });

    it('prefers a literal dotted key', () => {
      expect(CellHelper.getPath({ 'a.b': 1, a: { b: 2 } }, 'a.b')).toBe(1);
    });

    it('returns undefined for missing paths and never walks the prototype', () => {
      expect(CellHelper.getPath({ a: 1 }, 'a.b')).toBeUndefined();
      expect(CellHelper.getPath({}, 'constructor')).toBeUndefined();
      expect(CellHelper.getPath({}, '__proto__.polluted')).toBeUndefined();
    });
  });

  describe('toText', () => {
    it('handles null, dates, objects and primitives', () => {
      expect(CellHelper.toText(null)).toBe('');
      expect(CellHelper.toText(undefined)).toBe('');
      expect(CellHelper.toText(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-01T00:00:00.000Z');
      expect(CellHelper.toText(new Date('x'))).toBe('');
      expect(CellHelper.toText({ a: 1 })).toBe('{"a":1}');
      expect(CellHelper.toText(12)).toBe('12');
      expect(CellHelper.toText(false)).toBe('false');
    });
  });

  describe('toCsvCell', () => {
    it.each(['=1+1', '+1', '-1', '@SUM(A1)', '\t=1', '\r=1'])('neutralizes the formula prefix in %j', value => {
      expect(CellHelper.toCsvCell(value).replace(/^"/, '').startsWith("'")).toBe(true);
    });

    it('does not alter negative numbers', () => {
      expect(CellHelper.toCsvCell(-5)).toBe('-5');
    });

    it('quotes and escapes commas, quotes and line breaks', () => {
      expect(CellHelper.toCsvCell('a,b')).toBe('"a,b"');
      expect(CellHelper.toCsvCell('say "hi"')).toBe('"say ""hi"""');
      expect(CellHelper.toCsvCell('l1\nl2')).toBe('"l1\nl2"');
    });

    it('leaves plain text alone', () => {
      expect(CellHelper.toCsvCell('plain')).toBe('plain');
    });
  });

  describe('toSheetValue', () => {
    it('keeps typed values and truncates long text', () => {
      expect(CellHelper.toSheetValue(5)).toBe(5);
      expect(CellHelper.toSheetValue(true)).toBe(true);
      expect(CellHelper.toSheetValue(null)).toBeNull();
      expect(CellHelper.toSheetValue('x'.repeat(40000))).toHaveLength(32767);
    });
  });
});
