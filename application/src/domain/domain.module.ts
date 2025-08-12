import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { JOB_INJECT_TOKEN, MONGO_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { JobPersistence } from '@infrastructure/database/persistence/job.persistence';
import { MongoPersistence } from '@infrastructure/database/persistence/mongo.persistence';

const tokens: any = [JOB_INJECT_TOKEN, MONGO_INJECT_TOKEN];

@Module({
  imports: [InfrastructureModule],
  providers: [
    {
      provide: JOB_INJECT_TOKEN,
      useExisting: JobPersistence,
    },
    {
      provide: MONGO_INJECT_TOKEN,
      useExisting: MongoPersistence,
    },
  ],
  exports: [...tokens],
})
export class DomainModule {}
