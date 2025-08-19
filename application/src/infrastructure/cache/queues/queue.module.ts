import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EnvConfigModule } from '@common/env/env-config.module';
import { QueueConfigModule } from '@infrastructure/cache/cache.module';
import { SendJobProducer } from '@infrastructure/cache/queues/producers/send-job.producer';
import { SendJobSubscriber } from '@infrastructure/cache/queues/subscribers/send-job.subscriber';
import { SendJobProcessor } from '@infrastructure/cache/queues/processors/send-job.processor';

const producers = [SendJobProducer];
const subscribers = [SendJobSubscriber];
const processor = [SendJobProcessor];

@Module({
  imports: [BullModule.registerQueue({ name: 'send-job' }, { name: 'failed-jobs' }), EnvConfigModule, QueueConfigModule],
  providers: [...producers, ...subscribers, ...processor],
  exports: [...producers, ...subscribers, ...processor],
})
export class QueueModule {}
