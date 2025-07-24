import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';

const controllers: any = [];

@Module({
  imports: [ApplicationModule],
  controllers: [...controllers],
})
export class PresentationModule {}
