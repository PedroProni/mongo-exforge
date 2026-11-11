import { Readable } from 'stream';

export type LocalFile = {
  stream: Readable;
  size: number;
  filename: string;
  key: string;
};
