import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { ExportJobProcessor } from '@infrastructure/queue/export-job.processor';
import { QueueModule } from '@infrastructure/queue/queue.module';

@Module({
  imports: [QueueModule, ApplicationModule],
  providers: [ExportJobProcessor],
})
export class WorkerModule {}
