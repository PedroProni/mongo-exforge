import { INestApplication, Injectable, Logger } from '@nestjs/common';
import { EnvConfigService } from '@common/env/services/env-config.service';

@Injectable()
export class CorsService {
  private readonly logger = new Logger(CorsService.name);

  constructor(private readonly envConfigService: EnvConfigService) {}

  setCors(app: INestApplication): void {
    const allowed_origins = [this.envConfigService.getProdDomain(), this.envConfigService.getLocalDomain()].map(origin => origin.replace(/\/$/, '')).filter(origin => origin.length > 0);

    app.enableCors({
      origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
        if (!origin) return callback(null, true);
        const allowed = allowed_origins.includes(origin.trim().replace(/\/$/, ''));
        if (!allowed) this.logger.warn(`Blocked CORS origin: ${origin}`);
        return callback(null, allowed);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
    });
  }
}
