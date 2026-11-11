import { createReadStream, createWriteStream } from 'fs';
import { access, mkdir, rm, stat, unlink } from 'fs/promises';
import { dirname, resolve, sep } from 'path';
import { pipeline } from 'stream/promises';
import { Injectable } from '@nestjs/common';
import { SignedTokenHelper } from '@common/helpers/functions/signed-token.helper';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { LOCAL_FILES_ROUTE } from '@domain/constants/local-storage.constant';
import { StoragePort } from '@domain/ports/storage.port';
import { DownloadLinkInput } from '@domain/types/download-link-input.type';
import { LocalFile } from '@domain/types/local-file.type';
import { UploadInput } from '@domain/types/upload-input.type';

@Injectable()
export class LocalStorageAdapter implements StoragePort {
  private readonly root: string;
  private readonly secret: string;

  constructor(envConfigService: EnvConfigService) {
    this.root = resolve(envConfigService.getLocalStorageDir());
    this.secret = envConfigService.getJwtSecret();
  }

  async upload(input: UploadInput): Promise<void> {
    const target = this.pathOf(input.key);
    await mkdir(dirname(target), { recursive: true });
    try {
      await pipeline(input.body, createWriteStream(target));
    } catch (error) {
      await unlink(target).catch(() => undefined);
      throw error;
    }
  }

  async createDownloadUrl(input: DownloadLinkInput): Promise<string> {
    const token = SignedTokenHelper.sign({ key: input.key, filename: input.filename, exp: Date.now() + input.ttl_seconds * 1000 }, this.secret);
    return `/${LOCAL_FILES_ROUTE}/${token}`;
  }

  async open(token: string): Promise<LocalFile | null> {
    const payload = SignedTokenHelper.verify(token, this.secret);
    if (!payload) return null;
    try {
      const path = this.pathOf(payload.key);
      const info = await stat(path);
      return { stream: createReadStream(path), size: info.size, filename: payload.filename, key: payload.key };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    await rm(this.pathOf(key), { force: true });
  }

  async ping(): Promise<void> {
    await mkdir(this.root, { recursive: true });
    await access(this.root);
  }

  private pathOf(key: string): string {
    const path = resolve(this.root, key);
    if (!path.startsWith(this.root + sep)) throw new Error('Invalid storage key');
    return path;
  }
}
