import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { JobController } from '@presentation/controllers/job.controller';
import { MongoController } from '@presentation/controllers/mongo.controller';
import { UserController } from '@presentation/controllers/user.controller';

const controllers: any = [JobController, MongoController, UserController];

@Module({
  imports: [ApplicationModule],
  controllers: [...controllers],
})
export class PresentationModule {}
