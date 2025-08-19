import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EnvConfigModule } from '@common/env/env-config.module';
import { QueueConfigModule } from '@infrastructure/cache/cache.module';
import { SendJobProducer } from '@infrastructure/cache/queues/producers/send-job.producer';
import { SendJobSubscriber } from '@infrastructure/cache/queues/subscribers/send-job.subscriber';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { EncryptionService } from '@application/services/encryption.service';
import { ExportService } from '@application/services/export.service';

const producers = [SendJobProducer];
const subscribers = [SendJobSubscriber];

@Module({
  imports: [BullModule.registerQueue({ name: 'send-job' }, { name: 'failed-jobs' }), EnvConfigModule, QueueConfigModule, DatabaseModule],
  providers: [...producers, ...subscribers, EncryptionService, ExportService],
  exports: [...producers, ...subscribers],
})
export class QueueModule {}
