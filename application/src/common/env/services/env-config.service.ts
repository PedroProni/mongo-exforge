import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEnvConfig } from '@shared/interfaces/env-config.interface';

@Injectable()
export class EnvConfigService implements IEnvConfig {
  constructor(private configService: ConfigService) {}

  // Persistance
  getMongoUri(): string {
    return this.configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/myapp';
  }

  // Auth
  getAuthToken(): string {
    return this.configService.get<string>('AUTH_TOKEN') || '';
  }
  getJwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET') || '';
  }
  getEncryptionSecret(): string {
    return this.configService.get<string>('ENCRYPTION_SECRET') || '';
  }

  // Cors
  getLocalDomain(): string {
    return this.configService.get<string>('LOCAL_DOMAIN') || '';
  }

  getProdDomain(): string {
    return this.configService.get<string>('PROD_DOMAIN') || '';
  }

  // Source Mongo
  getSourceMongoUri(): string {
    return this.configService.get<string>('MONGODB_SOURCE_URI') || 'mongodb://localhost:27017/source';
  }

  // Redis
  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST') || '127.0.0.1';
  }

  getRedisPort(): number {
    return this.configService.get<number>('REDIS_PORT') || 6379;
  }
}
