export class JsonHelper {
  static convertToJsonBuffer<T extends object>(data: T[]): Buffer {
    try {
      const json_string = JSON.stringify(data, null, 2);
      return Buffer.from(json_string, 'utf-8');
    } catch (e: any) {
      throw new Error(`Error converting to JSON: ${e.message}`);
    }
  }
}
