import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { JOB_RATE_LIMIT_WINDOW_MS } from '@domain/constants/env.constant';
import { ApplicationModule } from '@application/application.module';
import { ConnectionController } from '@presentation/controllers/connection.controller';
import { StorageModule } from '@infrastructure/storage/storage.module';
import { DashboardController } from '@presentation/controllers/dashboard.controller';
import { PreviewController } from '@presentation/controllers/preview.controller';
import { TemplateController } from '@presentation/controllers/template.controller';
import { FilesController } from '@presentation/controllers/files.controller';
import { JobController } from '@presentation/controllers/job.controller';
import { MongoController } from '@presentation/controllers/mongo.controller';
import { UserController } from '@presentation/controllers/user.controller';

@Module({
  imports: [
    ApplicationModule,
    StorageModule,
    ThrottlerModule.forRootAsync({
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => ({ throttlers: [{ ttl: JOB_RATE_LIMIT_WINDOW_MS, limit: env.getJobRateLimitPerMinute() || Number.MAX_SAFE_INTEGER }] }),
    }),
  ],
  controllers: [FilesController, JobController, MongoController, UserController, ConnectionController, DashboardController, PreviewController, TemplateController],
})
export class PresentationModule {}
