import { Module } from '@nestjs/common';
import { S3StorageAdapter } from '@infrastructure/storage/s3-storage.adapter';
import { STORAGE_INJECT_TOKEN } from '@domain/tokens/inject.token';

@Module({
  providers: [S3StorageAdapter, { provide: STORAGE_INJECT_TOKEN, useExisting: S3StorageAdapter }],
  exports: [STORAGE_INJECT_TOKEN],
})
export class StorageModule {}
