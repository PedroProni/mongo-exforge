import { Parser } from 'json2csv';

export class CsvHelper {
  static convertToCsv<T extends object>(data: T[]): string {
    try {
      const fields = Object.keys(data[0]);
      const parser = new Parser({ fields });
      return parser.parse(data);
    } catch (e: any) {
      throw new Error(`Error converting to CSV: ${e.message}`);
    }
  }
}
