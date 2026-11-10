import { Readable } from 'stream';

export type UploadInput = {
  key: string;
  body: Readable;
  content_type: string;
};
