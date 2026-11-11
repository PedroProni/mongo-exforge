import { mkdtemp, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { LocalStorageAdapter } from '@infrastructure/storage/local-storage.adapter';

async function read(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

describe('LocalStorageAdapter', () => {
  let dir: string;
  let adapter: LocalStorageAdapter;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'exforge-local-'));
    adapter = new LocalStorageAdapter({ getLocalStorageDir: () => dir, getJwtSecret: () => 's'.repeat(32) } as unknown as EnvConfigService);
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('stores a file and serves it through a signed link', async () => {
    await adapter.upload({ key: 'exports/u1/j1.csv', body: Readable.from(['a,b\n', '1,2\n']), content_type: 'text/csv' });
    const url = await adapter.createDownloadUrl({ key: 'exports/u1/j1.csv', filename: 'x.csv', ttl_seconds: 60 });
    expect(url.startsWith('/files/')).toBe(true);
    const file = await adapter.open(url.replace('/files/', ''));
    expect(file?.filename).toBe('x.csv');
    expect(await read(file!.stream)).toBe('a,b\n1,2\n');
  });

  it('refuses a forged or expired link', async () => {
    await adapter.upload({ key: 'exports/u1/j1.csv', body: Readable.from(['x']), content_type: 'text/csv' });
    expect(await adapter.open('forged.token')).toBeNull();
    const expired = await adapter.createDownloadUrl({ key: 'exports/u1/j1.csv', filename: 'x.csv', ttl_seconds: -1 });
    expect(await adapter.open(expired.replace('/files/', ''))).toBeNull();
  });

  it('rejects keys that escape the storage root', async () => {
    await expect(adapter.upload({ key: '../outside.csv', body: Readable.from(['x']), content_type: 'text/csv' })).rejects.toThrow('Invalid storage key');
    await expect(adapter.delete('../../etc/passwd')).rejects.toThrow('Invalid storage key');
  });

  it('deletes a file and no longer serves it', async () => {
    await adapter.upload({ key: 'exports/u1/j2.csv', body: Readable.from(['x']), content_type: 'text/csv' });
    const url = await adapter.createDownloadUrl({ key: 'exports/u1/j2.csv', filename: 'x.csv', ttl_seconds: 60 });
    await adapter.delete('exports/u1/j2.csv');
    expect(await adapter.open(url.replace('/files/', ''))).toBeNull();
    await expect(readFile(join(dir, 'exports/u1/j2.csv'))).rejects.toThrow();
  });

  it('removes the partial file when the upload stream fails', async () => {
    const failing = new Readable({
      read() {
        this.destroy(new Error('boom'));
      },
    });
    await expect(adapter.upload({ key: 'exports/u1/j3.csv', body: failing, content_type: 'text/csv' })).rejects.toThrow('boom');
    await expect(readFile(join(dir, 'exports/u1/j3.csv'))).rejects.toThrow();
  });
});
