import { Module } from '@nestjs/common';
import { CorsService } from '@infrastructure/http-security/services/cors.service';
import { HelmetService } from '@infrastructure/http-security/services/helmet.service';
import { CsrfService } from '@infrastructure/http-security/services/csrf.service';
import { EnvConfigModule } from '@common/env/env-config.module';

@Module({
  imports: [EnvConfigModule],
  providers: [CorsService, HelmetService, CsrfService],
  exports: [CorsService, HelmetService, CsrfService],
})
export class HttpSecurityModule {}
