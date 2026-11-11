import { ExportRejectedError } from '@application/errors/export-rejected.error';

export type ExportCounter = { rows: number; rejection?: ExportRejectedError };
