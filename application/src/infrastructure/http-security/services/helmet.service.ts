import { Injectable, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

@Injectable()
export class HelmetService {
  private readonly logger = new Logger(HelmetService.name);

  applyHelmet(app: any) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api')) {
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com'],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'"],
            },
          },
          frameguard: { action: 'deny' },
          hidePoweredBy: true,
          hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
          referrerPolicy: { policy: 'no-referrer' },
        })(req, res, next);
      } else {
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", 'https:'],
              imgSrc: ["'self'", 'data:', 'https:'],
              connectSrc: ["'self'"],
            },
          },
          frameguard: { action: 'deny' },
          hidePoweredBy: true,
          hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
          referrerPolicy: { policy: 'no-referrer' },
        })(req, res, next);
      }
    });

    this.logger.log('Helmet (with Swagger compatibility) has been configured');
  }
}
