import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from '@infrastructure/documentation/swagger';
import { CorsService } from '@infrastructure/http-security/services/cors.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(new ValidationPipe());
  const corsService = app.get(CorsService);
  await corsService.setCors(app);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
