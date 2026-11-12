import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { Job, JobSchema } from '@infrastructure/database/schemas/job.schema';
import { User, UserSchema } from '@infrastructure/database/schemas/user.schema';
import { Template, TemplateSchema } from '@infrastructure/database/schemas/template.schema';
import { Connection, ConnectionSchema } from '@infrastructure/database/schemas/connection.schema';
import { ConnectionPersistence } from '@infrastructure/database/persistence/connection.persistence';
import { JobPersistence } from '@infrastructure/database/persistence/job.persistence';
import { TemplatePersistence } from '@infrastructure/database/persistence/template.persistence';
import { UserPersistence } from '@infrastructure/database/persistence/user.persistence';
import { MongoSourceAdapter } from '@infrastructure/integrations/mongo-source.adapter';
import { UriGuardService } from '@infrastructure/network/uri-guard.service';
import { CONNECTION_INJECT_TOKEN, JOB_INJECT_TOKEN, MONGO_INJECT_TOKEN, TEMPLATE_INJECT_TOKEN, USER_INJECT_TOKEN } from '@domain/constants/inject.constant';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => ({ uri: env.getMongoUri(), serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 }),
    }),
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: User.name, schema: UserSchema },
      { name: Connection.name, schema: ConnectionSchema },
      { name: Template.name, schema: TemplateSchema },
    ]),
  ],
  providers: [
    UriGuardService,
    JobPersistence,
    UserPersistence,
    ConnectionPersistence,
    TemplatePersistence,
    MongoSourceAdapter,
    { provide: JOB_INJECT_TOKEN, useExisting: JobPersistence },
    { provide: USER_INJECT_TOKEN, useExisting: UserPersistence },
    { provide: CONNECTION_INJECT_TOKEN, useExisting: ConnectionPersistence },
    { provide: TEMPLATE_INJECT_TOKEN, useExisting: TemplatePersistence },
    { provide: MONGO_INJECT_TOKEN, useExisting: MongoSourceAdapter },
  ],
  exports: [JOB_INJECT_TOKEN, USER_INJECT_TOKEN, CONNECTION_INJECT_TOKEN, TEMPLATE_INJECT_TOKEN, MONGO_INJECT_TOKEN, MongooseModule],
})
export class DatabaseModule {}
