import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { EnvConfigService } from '@common/env/services/env-config.service';

@Injectable()
export class EncryptionService {
  private readonly secret_key: Buffer;

  constructor(private readonly envConfigService: EnvConfigService) {
    this.secret_key = Buffer.from(this.envConfigService.getEncryptionSecret(), 'hex');
  }

  encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.secret_key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(data: string): string {
    const [iv_hex, encrypted] = data.split(':');

    const iv = Buffer.from(iv_hex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', this.secret_key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
