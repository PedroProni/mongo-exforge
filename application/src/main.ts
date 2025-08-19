import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { join } from 'path';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@infrastructure/documentation/swagger';
import { CorsService } from '@infrastructure/http-security/services/cors.service';
import { setupBullDashboard } from '@infrastructure/cache/dashboard/bull-dashboard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.use('/exports', express.static(join(process.cwd(), 'tmp', 'exports')));

  const corsService = app.get(CorsService);
  await corsService.setCors(app);
  const envConfigService = app.get(EnvConfigService);

  const queues: Queue[] = [app.get<Queue>(getQueueToken('send-job')), app.get<Queue>(getQueueToken('failed-jobs'))];

  const serverAdapter = setupBullDashboard(queues, envConfigService);
  app.use('/bull-board', serverAdapter.getRouter());

  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
