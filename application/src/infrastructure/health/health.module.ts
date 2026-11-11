import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@infrastructure/health/health.controller';
import { QueueModule } from '@infrastructure/queue/queue.module';
import { StorageModule } from '@infrastructure/storage/storage.module';

@Module({
  imports: [TerminusModule, QueueModule, StorageModule],
  controllers: [HealthController],
})
export class HealthModule {}
