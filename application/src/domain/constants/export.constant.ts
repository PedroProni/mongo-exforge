import { ExportFormat } from '@domain/enums/export-format.enum';

export const EXPORT_CONTENT_TYPES: Record<ExportFormat, string> = {
  [ExportFormat.CSV]: 'text/csv; charset=utf-8',
  [ExportFormat.JSON]: 'application/json',
  [ExportFormat.XLSX]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const CSV_COLUMN_SAMPLE_ROWS = 200;
export const CURSOR_BATCH_SIZE = 1000;
export const CURSOR_MAX_TIME_MS = 10 * 60 * 1000;
export const XLSX_SHEET_NAME = 'Export';
export const XLSX_COLUMN_WIDTH = 20;
export const CSV_FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];
export const DOWNLOAD_LINK_TTL_SECONDS = 300;
export const OBJECT_KEY_PREFIX = 'exports';
export const DEFAULT_FILE_BASENAME = 'export';
export const MAX_FILE_BASENAME_LENGTH = 80;
export const XLSX_MAX_ROWS = 1048575;
