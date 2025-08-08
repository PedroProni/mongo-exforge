import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { CsvHelper } from '@common/helpers/functions/csv.helper';
import { JsonHelper } from '@common/helpers/functions/json.helper';
import { XlsxHelper } from '@common/helpers/functions/xlsx.helper';
import { ExportFormat } from '@domain/enums/all.enums';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private readonly export_dir = join(process.cwd(), 'tmp', 'exports');
  private readonly expire_ms = 1 * 60 * 60 * 1000;

  constructor() {
    this.ensureExportDir();
  }

  private async ensureExportDir() {
    try {
      await fs.mkdir(this.export_dir, { recursive: true });
      this.logger.log(`Export directory ensured at ${this.export_dir}`);
    } catch (e: any) {
      this.logger.error(`Failed to create export directory: ${e.message}`);
    }
  }

  async generateExportFile<T extends object>(data: T[], format: ExportFormat): Promise<string> {
    let buffer: Buffer;

    switch (format) {
      case 'json':
        buffer = JsonHelper.convertToJsonBuffer(data);
        break;
      case 'csv':
        const csvString = CsvHelper.convertToCsv(data);
        buffer = Buffer.from(csvString, 'utf-8');
        break;
      case 'xlsx':
        buffer = await XlsxHelper.convertToXlsx(data);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    const filename = `${randomUUID()}.${format}`;
    const filepath = join(this.export_dir, filename);

    await fs.writeFile(filepath, buffer);
    this.logger.log(`Export file written: ${filename}`);

    setTimeout(async () => {
      try {
        await fs.unlink(filepath);
        this.logger.log(`Deleted expired export file: ${filename}`);
      } catch {
        this.logger.error(`Failed to delete expired export file: ${filename}`);
      }
    }, this.expire_ms);

    return `/exports/${filename}`;
  }
}
