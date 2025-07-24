import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEnvConfig } from '@shared/interfaces/env-config.interface';

@Injectable()
export class EnvConfigService implements IEnvConfig {
    constructor(private configService: ConfigService) { }
    
    // Persistance
    getMongoUri(): string {
        return this.configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/myapp';
    }

    // Auth
    getAuthToken(): string {
        return this.configService.get<string>('AUTH_TOKEN') || '';
    }

    // Cors
    getLocalDomain(): string {
        return this.configService.get<string>('LOCAL_DOMAIN') || '';
    }
    
    getProdDomain(): string {
        return this.configService.get<string>('PROD_DOMAIN') || '';
    }
}
