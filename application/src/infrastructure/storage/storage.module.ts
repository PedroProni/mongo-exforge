import { Module } from '@nestjs/common';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { LocalStorageAdapter } from '@infrastructure/storage/local-storage.adapter';
import { S3StorageAdapter } from '@infrastructure/storage/s3-storage.adapter';
import { StorageDriver } from '@domain/enums/storage-driver.enum';
import { StoragePort } from '@domain/ports/storage.port';
import { STORAGE_INJECT_TOKEN } from '@domain/constants/inject.constant';

@Module({
  providers: [
    {
      provide: STORAGE_INJECT_TOKEN,
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService): StoragePort => (env.getStorageDriver() === StorageDriver.LOCAL ? new LocalStorageAdapter(env) : new S3StorageAdapter(env)),
    },
  ],
  exports: [STORAGE_INJECT_TOKEN],
})
export class StorageModule {}
