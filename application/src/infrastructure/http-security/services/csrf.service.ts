import { Injectable, Logger } from '@nestjs/common';
import csurf from 'csurf';

@Injectable()
export class CsrfService {
  private readonly logger = new Logger(CsrfService.name);

  applyCsrf(app: any) {
    app.use(
      csurf({
        cookie: {
          httpOnly: true,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        },
      }),
    );

    this.logger.log('CSRF middleware has been configured');
  }
}
