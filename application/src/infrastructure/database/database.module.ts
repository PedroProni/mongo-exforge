import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectionModule } from '@infrastructure/database/connection/mongo-connect.module';
import { EnvConfigModule } from '@common/env/env-config.module';
import { HelperModule } from '@common/helpers/helper.module';
import { JobPersistence } from '@infrastructure/database/persistence/job.persistence';
import { Job, JobSchema } from '@infrastructure/database/schemas/job.schema';
import { MongoPersistence } from './persistence/mongo.persistence';

const persistences: any = [JobPersistence, MongoPersistence];

@Module({
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]), ConnectionModule, EnvConfigModule, HelperModule],
  providers: [...persistences],
  exports: [ConnectionModule, ...persistences],
})
export class DatabaseModule {}
