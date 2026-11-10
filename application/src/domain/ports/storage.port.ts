import { DownloadLinkInput } from '@domain/types/download-link-input.type';
import { UploadInput } from '@domain/types/upload-input.type';

export interface StoragePort {
  upload(input: UploadInput): Promise<void>;
  createDownloadUrl(input: DownloadLinkInput): Promise<string>;
  delete(key: string): Promise<void>;
  ping(): Promise<void>;
}
