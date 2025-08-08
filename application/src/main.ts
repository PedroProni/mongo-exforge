import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@infrastructure/documentation/swagger';
import { CorsService } from '@infrastructure/http-security/services/cors.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use('/exports', express.static(join(process.cwd(), 'tmp', 'exports')));
  const corsService = app.get(CorsService);
  await corsService.setCors(app);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
