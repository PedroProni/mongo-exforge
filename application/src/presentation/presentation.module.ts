import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { JobController } from '@presentation/controllers/job.controller';

const controllers: any = [JobController];

@Module({
  imports: [ApplicationModule],
  controllers: [...controllers],
})
export class PresentationModule {}
