import { Module } from '@nestjs/common';
import use_cases from '@application/use-cases/export-all.use-cases';
import { DomainModule } from '@domain/domain.module';
import { ExportService } from '@application/services/export.service';

@Module({
  imports: [DomainModule],
  providers: [...use_cases, ExportService],
  exports: [...use_cases],
})
export class ApplicationModule {}
