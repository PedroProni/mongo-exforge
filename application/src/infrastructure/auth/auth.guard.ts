import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { EnvConfigService } from '@common/env/services/env-config.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly envService: EnvConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    let auth_header = request.headers['authorization']?.trim();
    const auth_header_parts = auth_header?.split(' ');

    if (auth_header_parts && auth_header_parts.length === 2) {
      auth_header = auth_header_parts[1];
    }
    
    const expected_token = this.envService.getAuthToken();

    if (!auth_header || auth_header !== expected_token) {
      throw new UnauthorizedException('Unauthorized');
    }

    (request as any)['authToken'] = auth_header;

    return true;
  }
}
