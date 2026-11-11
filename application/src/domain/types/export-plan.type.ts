import { ExportRow } from '@domain/types/export-row.type';

export type ExportPlan = {
  columns: string[];
  rows: AsyncIterable<ExportRow>;
};
