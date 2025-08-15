import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { JOB_INJECT_TOKEN, MONGO_INJECT_TOKEN, USER_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { JobPersistence } from '@infrastructure/database/persistence/job.persistence';
import { MongoPersistence } from '@infrastructure/database/persistence/mongo.persistence';
import { UserPersistence } from '@infrastructure/database/persistence/user.persistence';

const tokens: any = [JOB_INJECT_TOKEN, MONGO_INJECT_TOKEN, USER_INJECT_TOKEN];

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
    {
      provide: USER_INJECT_TOKEN,
      useExisting: UserPersistence,
    },
  ],
  exports: [...tokens],
})
export class DomainModule {}
