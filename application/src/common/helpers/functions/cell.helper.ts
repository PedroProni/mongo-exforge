import { CSV_FORMULA_PREFIXES, MAX_SHEET_TEXT_LENGTH } from '@domain/constants/export.constant';
import { ExportRow } from '@domain/types/export-row.type';

export class CellHelper {
  static getPath(row: ExportRow, path: string): unknown {
    if (Object.prototype.hasOwnProperty.call(row, path)) return row[path];
    let current: unknown = row;
    for (const segment of path.split('.')) {
      if (current === null || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
      current = (current as Record<string, unknown>)[segment];
    }
    return current;
  }

  static toText(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
    if (typeof value === 'object') {
      if ('_bsontype' in value) return (value as { toString(): string }).toString();
      return JSON.stringify(value);
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return String(value);
  }

  static toCsvCell(value: unknown): string {
    let text = CellHelper.toText(value);
    if (typeof value === 'string' && text.length > 0 && CSV_FORMULA_PREFIXES.includes(text[0])) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  static toSheetValue(value: unknown): string | number | boolean | Date | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    return CellHelper.toText(value).slice(0, MAX_SHEET_TEXT_LENGTH);
  }
}
