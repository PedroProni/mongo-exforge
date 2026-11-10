import { INestApplication, Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { SWAGGER_API_ROOT } from '@infrastructure/documentation/config/swagger-constants.config';

@Injectable()
export class HelmetService {
  applyHelmet(app: INestApplication): void {
    const strict = helmet();
    const relaxed = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    });

    app.use((request: Request, response: Response, next: NextFunction) => {
      const is_docs = request.path === `/${SWAGGER_API_ROOT}` || request.path.startsWith(`/${SWAGGER_API_ROOT}/`);
      (is_docs ? relaxed : strict)(request, response, next);
    });
  }
}
