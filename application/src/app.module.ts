import { Module } from '@nestjs/common';
import { EnvConfigModule } from '@common/env/env-config.module';
import { AuthModule } from '@infrastructure/auth/auth.module';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { HealthModule } from '@infrastructure/health/health.module';
import { HttpSecurityModule } from '@infrastructure/http-security/http-security.module';
import { WorkerModule } from '@infrastructure/queue/worker.module';
import { SchedulerModule } from '@infrastructure/scheduler/scheduler.module';
import { PresentationModule } from '@presentation/presentation.module';

@Module({
  imports: [EnvConfigModule, DatabaseModule, AuthModule, HttpSecurityModule, HealthModule, WorkerModule, SchedulerModule, PresentationModule],
})
export class AppModule {}
