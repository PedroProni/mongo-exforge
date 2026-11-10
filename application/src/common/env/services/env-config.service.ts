import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_EXPORT_ATTEMPTS, DEFAULT_EXPORT_CONCURRENCY, DEFAULT_EXPORT_MAX_ROWS, DEFAULT_EXPORT_TTL_HOURS, DEFAULT_JWT_EXPIRES_IN } from '@domain/constants/env.constant';
import { DEFAULT_PORT, DEFAULT_REDIS_HOST, DEFAULT_REDIS_PORT, DEFAULT_S3_REGION, PRODUCTION_STAGE } from '@domain/constants/env.constant';
import { S3Config } from '@domain/types/s3-config.type';

@Injectable()
export class EnvConfigService {
  constructor(private readonly configService: ConfigService) {}

  private text(key: string, fallback = ''): string {
    return (this.configService.get<string>(key) ?? fallback).trim();
  }

  private integer(key: string, fallback: number): number {
    const parsed = Number.parseInt(this.text(key), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private flag(key: string): boolean {
    return this.text(key).toLowerCase() === 'true';
  }

  isProduction(): boolean {
    return this.text('NODE_ENV') === PRODUCTION_STAGE;
  }

  getPort(): number {
    return this.integer('PORT', DEFAULT_PORT);
  }

  getMongoUri(): string {
    return this.text('MONGODB_URI');
  }

  getJwtSecret(): string {
    return this.text('JWT_SECRET');
  }

  getJwtExpiresIn(): string {
    return this.text('JWT_EXPIRES_IN', DEFAULT_JWT_EXPIRES_IN);
  }

  getEncryptionSecret(): string {
    return this.text('ENCRYPTION_SECRET');
  }

  getLocalDomain(): string {
    return this.text('LOCAL_DOMAIN');
  }

  getProdDomain(): string {
    return this.text('PROD_DOMAIN');
  }

  getRedisHost(): string {
    return this.text('REDIS_HOST', DEFAULT_REDIS_HOST);
  }

  getRedisPort(): number {
    return this.integer('REDIS_PORT', DEFAULT_REDIS_PORT);
  }

  getRedisPassword(): string | undefined {
    return this.text('REDIS_PASSWORD') || undefined;
  }

  getBasicAuthUsername(): string {
    return this.text('BASIC_AUTH_USERNAME');
  }

  getBasicAuthPassword(): string {
    return this.text('BASIC_AUTH_PASSWORD');
  }

  allowPrivateUris(): boolean {
    return !this.isProduction() && this.flag('EXFORGE_ALLOW_PRIVATE_URIS');
  }

  getExportTtlHours(): number {
    return this.integer('EXPORT_TTL_HOURS', DEFAULT_EXPORT_TTL_HOURS);
  }

  getExportMaxRows(): number {
    return this.integer('EXPORT_MAX_ROWS', DEFAULT_EXPORT_MAX_ROWS);
  }

  getExportAttempts(): number {
    return this.integer('EXPORT_ATTEMPTS', DEFAULT_EXPORT_ATTEMPTS);
  }

  getExportConcurrency(): number {
    return this.integer('EXPORT_CONCURRENCY', DEFAULT_EXPORT_CONCURRENCY);
  }

  getS3Config(): S3Config {
    return {
      endpoint: this.text('S3_ENDPOINT'),
      public_endpoint: this.text('S3_PUBLIC_ENDPOINT') || this.text('S3_ENDPOINT'),
      region: this.text('S3_REGION', DEFAULT_S3_REGION),
      bucket: this.text('S3_BUCKET'),
      access_key_id: this.text('S3_ACCESS_KEY_ID'),
      secret_access_key: this.text('S3_SECRET_ACCESS_KEY'),
      force_path_style: this.flag('S3_FORCE_PATH_STYLE'),
      auto_create_bucket: this.flag('S3_AUTO_CREATE_BUCKET'),
    };
  }
}
