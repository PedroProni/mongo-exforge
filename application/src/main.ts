import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { setupBullBoard } from '@infrastructure/dashboard/bull-board';
import { setupSwagger } from '@infrastructure/documentation/swagger';
import { CorsService } from '@infrastructure/http-security/cors.service';
import { HelmetService } from '@infrastructure/http-security/helmet.service';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const envConfigService = app.get(EnvConfigService);

  if (envConfigService.trustProxy()) app.set('trust proxy', 1);
  app.get(HelmetService).applyHelmet(app);
  app.get(CorsService).setCors(app);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  setupBullBoard(app, envConfigService);
  setupSwagger(app);
  app.enableShutdownHooks();

  await app.listen(envConfigService.getPort());
}

void bootstrap();
