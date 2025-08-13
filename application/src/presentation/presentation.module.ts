import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { JobController } from '@presentation/controllers/job.controller';
import { MongoController } from '@presentation/controllers/mongo.controller';

const controllers: any = [JobController, MongoController];

@Module({
  imports: [ApplicationModule],
  controllers: [...controllers],
})
export class PresentationModule {}
