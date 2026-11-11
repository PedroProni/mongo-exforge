import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { ENCRYPTION_ALGORITHM, ENCRYPTION_IV_BYTES, ENCRYPTION_KEY_BYTES, ENCRYPTION_SEPARATOR, ENCRYPTION_VERSION } from '@domain/constants/encryption.constant';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(envConfigService: EnvConfigService) {
    this.key = Buffer.from(envConfigService.getEncryptionSecret(), 'hex');
    if (this.key.length !== ENCRYPTION_KEY_BYTES) throw new Error('ENCRYPTION_SECRET must decode to 32 bytes');
  }

  encrypt(plain: string): string {
    const iv = randomBytes(ENCRYPTION_IV_BYTES);
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return [ENCRYPTION_VERSION, iv.toString('hex'), cipher.getAuthTag().toString('hex'), encrypted.toString('hex')].join(ENCRYPTION_SEPARATOR);
  }

  decrypt(payload: string): string {
    const [version, iv_hex, tag_hex, data_hex] = payload.split(ENCRYPTION_SEPARATOR);
    if (version !== ENCRYPTION_VERSION || !iv_hex || !tag_hex || !data_hex) throw new Error('Unsupported encrypted payload');
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, this.key, Buffer.from(iv_hex, 'hex'));
    decipher.setAuthTag(Buffer.from(tag_hex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(data_hex, 'hex')), decipher.final()]).toString('utf8');
  }
}
