import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import use_cases from '@application/use-cases/export-all.use-cases';
import { DomainModule } from '@domain/domain.module';
import { ExportService } from '@application/services/export.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    DomainModule,
  ],
  providers: [...use_cases, ExportService],
  exports: [...use_cases],
})
export class ApplicationModule {}
