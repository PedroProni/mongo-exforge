import { Module } from '@nestjs/common';
import { CorsService } from '@infrastructure/http-security/cors.service';
import { HelmetService } from '@infrastructure/http-security/helmet.service';

@Module({
  providers: [CorsService, HelmetService],
  exports: [CorsService, HelmetService],
})
export class HttpSecurityModule {}
