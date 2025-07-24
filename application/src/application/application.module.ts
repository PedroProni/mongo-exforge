import { Module } from '@nestjs/common';
import use_cases from '@application/use-cases/export-all.use-cases';
import { DomainModule } from '@domain/domain.module';

@Module({
  imports: [DomainModule],
   providers: [...use_cases],
   exports: [...use_cases],
})
export class ApplicationModule {}
