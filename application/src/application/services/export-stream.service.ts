import { Injectable } from '@nestjs/common';
import { once } from 'events';
import { PassThrough, Readable } from 'stream';
import ExcelJS from 'exceljs';
import { CellHelper } from '@common/helpers/functions/cell.helper';
import { CSV_COLUMN_SAMPLE_ROWS, XLSX_COLUMN_WIDTH, XLSX_SHEET_NAME } from '@domain/constants/export.constant';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { ExportRow } from '@domain/types/export-row.type';
import { ExportPlan } from '@domain/types/export-plan.type';

@Injectable()
export class ExportStreamService {
  create(format: ExportFormat, fields: string[], rows: AsyncIterable<ExportRow>): Readable {
    switch (format) {
      case ExportFormat.CSV:
        return Readable.from(this.csv(fields, rows), { objectMode: false });
      case ExportFormat.JSON:
        return Readable.from(this.json(rows), { objectMode: false });
      case ExportFormat.XLSX:
        return this.xlsx(fields, rows);
      default:
        throw new Error(`Unsupported format: ${String(format)}`);
    }
  }

  async plan(fields: string[], rows: AsyncIterable<ExportRow>): Promise<ExportPlan> {
    if (fields.length > 0) return { columns: fields, rows };

    const iterator = rows[Symbol.asyncIterator]();
    const buffered: ExportRow[] = [];
    const keys = new Set<string>();
    while (buffered.length < CSV_COLUMN_SAMPLE_ROWS) {
      const next = await iterator.next();
      if (next.done) break;
      buffered.push(next.value);
      Object.keys(next.value).forEach(key => keys.add(key));
    }

    async function* chain(): AsyncGenerator<ExportRow> {
      try {
        yield* buffered;
        for (;;) {
          const next = await iterator.next();
          if (next.done) return;
          yield next.value;
        }
      } finally {
        await iterator.return?.();
      }
    }

    return { columns: Array.from(keys), rows: chain() };
  }

  private async *csv(fields: string[], rows: AsyncIterable<ExportRow>): AsyncGenerator<string> {
    const plan = await this.plan(fields, rows);
    yield `${plan.columns.map(column => CellHelper.toCsvCell(column)).join(',')}\r\n`;
    for await (const row of plan.rows) yield `${plan.columns.map(column => CellHelper.toCsvCell(CellHelper.getPath(row, column))).join(',')}\r\n`;
  }

  private async *json(rows: AsyncIterable<ExportRow>): AsyncGenerator<string> {
    yield '[';
    let first = true;
    for await (const row of rows) {
      yield `${first ? '' : ','}${JSON.stringify(row)}`;
      first = false;
    }
    yield ']';
  }

  private xlsx(fields: string[], rows: AsyncIterable<ExportRow>): Readable {
    const output = new PassThrough();
    void (async () => {
      try {
        const plan = await this.plan(fields, rows);
        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: output, useStyles: false, useSharedStrings: false });
        const sheet = workbook.addWorksheet(XLSX_SHEET_NAME);
        sheet.columns = plan.columns.map(column => ({ header: column, key: column, width: XLSX_COLUMN_WIDTH }));
        for await (const row of plan.rows) {
          sheet.addRow(plan.columns.map(column => CellHelper.toSheetValue(CellHelper.getPath(row, column)))).commit();
          if (output.writableNeedDrain) await once(output, 'drain');
        }
        sheet.commit();
        await workbook.commit();
      } catch (error) {
        output.destroy(error as Error);
      }
    })();
    return output;
  }
}
