import { ExportRow } from '@domain/types/export-row.type';

export type PreviewResult = {
  rows: ExportRow[];
  estimated_total: number | null;
  estimate_capped: boolean;
};
