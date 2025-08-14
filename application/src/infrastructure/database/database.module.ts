import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectionModule } from '@infrastructure/database/connection/mongo-connect.module';
import { EnvConfigModule } from '@common/env/env-config.module';
import { HelperModule } from '@common/helpers/helper.module';
import { JobPersistence } from '@infrastructure/database/persistence/job.persistence';
import { Job, JobSchema } from '@infrastructure/database/schemas/job.schema';
import { MongoPersistence } from '@infrastructure/database/persistence/mongo.persistence';
import { UserPersistence } from '@infrastructure/database/persistence/user.persistence';
import { User, UserSchema } from '@infrastructure/database/schemas/user.schema';

const persistences: any = [JobPersistence, MongoPersistence, UserPersistence];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ConnectionModule,
    EnvConfigModule,
    HelperModule,
  ],
  providers: [...persistences],
  exports: [ConnectionModule, ...persistences],
})
export class DatabaseModule {}
