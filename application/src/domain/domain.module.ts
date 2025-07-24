import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { JOB_INJECT_TOKEN } from '@domain/tokens/inject.token';

const tokens: any = [JOB_INJECT_TOKEN]

@Module({
  imports: [InfrastructureModule],
  providers: [
    // {
    //   provide: JOB_INJECT_TOKEN
    //   useExisting: JobPersistence
    // }
  ],
  exports: [...tokens],
})
export class DomainModule {}
