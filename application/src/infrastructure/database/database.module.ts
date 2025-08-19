import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectionModule } from '@infrastructure/database/connection/mongo-connect.module';
import { EnvConfigModule } from '@common/env/env-config.module';
import { HelperModule } from '@common/helpers/helper.module';
import { Job, JobSchema } from '@infrastructure/database/schemas/job.schema';
import { JobPersistence } from '@infrastructure/database/persistence/job.persistence';
import { Mongo, MongoSchema } from '@infrastructure/database/schemas/mongo.schema';
import { MongoPersistence } from '@infrastructure/database/persistence/mongo.persistence';
import { User, UserSchema } from '@infrastructure/database/schemas/user.schema';
import { UserPersistence } from '@infrastructure/database/persistence/user.persistence';
import { RedisService } from '@infrastructure/services/redis.service';
import { MongoConnection } from '@infrastructure/integrations/mongo-integration';

const persistences: any = [JobPersistence, MongoPersistence, UserPersistence];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Mongo.name, schema: MongoSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ConnectionModule,
    EnvConfigModule,
    HelperModule,
  ],
  providers: [...persistences, RedisService, MongoConnection],
  exports: [ConnectionModule, ...persistences],
})
export class DatabaseModule {}
