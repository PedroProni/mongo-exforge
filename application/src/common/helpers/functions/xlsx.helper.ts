import ExcelJS from 'exceljs';

export class XlsxHelper {
  static async convertToXlsx<T extends object>(data: T[]): Promise<Buffer> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Mongo Export');

      const fields = Object.keys(data[0]);
      worksheet.columns = fields.map(field => ({
        header: field,
        key: field,
        width: 20,
      }));

      data.forEach(item => worksheet.addRow(item));

      const array_buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(array_buffer);
    } catch (e: any) {
      throw new Error(`Error converting to XLSX: ${e.message}`);
    }
  }
}
