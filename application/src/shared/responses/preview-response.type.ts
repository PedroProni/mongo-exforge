export type PreviewResponse = {
  rows: Record<string, unknown>[];
  columns: string[];
  row_limit: number;
  estimated_total: number | null;
  estimate_capped: boolean;
};
