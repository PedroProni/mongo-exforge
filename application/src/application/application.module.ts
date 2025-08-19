import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import use_cases from '@application/use-cases/export-all.use-cases';
import { DomainModule } from '@domain/domain.module';
import { ExportService } from '@application/services/export.service';
import { EncryptionService } from '@application/services/encryption.service';
import { EnvConfigModule } from '@common/env/env-config.module';
import { QueueModule } from '@infrastructure/cache/queues/queue.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    DomainModule,
    EnvConfigModule,
    QueueModule
  ],
  providers: [...use_cases, ExportService, EncryptionService],
  exports: [...use_cases],
})
export class ApplicationModule {}
