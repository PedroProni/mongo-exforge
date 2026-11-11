import { StoragePort } from '@domain/ports/storage.port';
import { DownloadLinkInput } from '@domain/types/download-link-input.type';

export class InMemoryStorage implements Pick<StoragePort, 'createDownloadUrl' | 'delete'> {
  readonly deleted: string[] = [];
  failOn = new Set<string>();

  async createDownloadUrl(input: DownloadLinkInput): Promise<string> {
    return `https://storage.test/${input.key}?filename=${input.filename}&ttl=${input.ttl_seconds}`;
  }

  async delete(key: string): Promise<void> {
    if (this.failOn.has(key)) throw new Error('storage down');
    this.deleted.push(key);
  }
}
