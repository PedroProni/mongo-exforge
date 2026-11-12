import { ExportStatus } from '@domain/enums/export-status.enum';

export type JobFilter = {
  status?: ExportStatus;
  q?: string;
};
