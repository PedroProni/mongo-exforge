export class ExportRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExportRejectedError';
  }
}
