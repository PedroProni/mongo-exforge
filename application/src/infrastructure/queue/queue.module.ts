import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { BullJobQueueAdapter } from '@infrastructure/queue/bull-job-queue.adapter';
import { EXPORT_QUEUE_NAME } from '@domain/constants/queue.constant';
import { JOB_QUEUE_INJECT_TOKEN } from '@domain/tokens/inject.token';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => ({ connection: { host: env.getRedisHost(), port: env.getRedisPort(), password: env.getRedisPassword(), maxRetriesPerRequest: null } }),
    }),
    BullModule.registerQueue({ name: EXPORT_QUEUE_NAME }),
  ],
  providers: [BullJobQueueAdapter, { provide: JOB_QUEUE_INJECT_TOKEN, useExisting: BullJobQueueAdapter }],
  exports: [JOB_QUEUE_INJECT_TOKEN, BullModule],
})
export class QueueModule {}
