import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ApplicationModule } from '@application/application.module';
import { CleanupScheduler } from '@infrastructure/scheduler/cleanup.scheduler';

@Module({
  imports: [ScheduleModule.forRoot(), ApplicationModule],
  providers: [CleanupScheduler],
})
export class SchedulerModule {}
