import { ExportFormat, ExportStatus } from '@domain/enums/all.enums';

export class CreateJobCommand {
  constructor(
    public readonly _id: string,
    public readonly user_id: string,
    public readonly name: string,
    public readonly status: ExportStatus,
    public readonly export_format: ExportFormat,
    public readonly join_field: string,
    public readonly query: any,
    public readonly fields?: string[],
    public readonly sort?: Record<string, 1 | -1>,
    public readonly file_url?: string,
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}
}
