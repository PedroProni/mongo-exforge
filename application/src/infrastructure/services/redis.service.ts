import { EnvConfigService } from '@common/env/services/env-config.service';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  constructor(private readonly envConfigService: EnvConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.envConfigService.getRedisHost(),
      port: this.envConfigService.getRedisPort(),
    });
  }

  onModuleDestroy() {
    this.client.quit();
  }

  async set(key: string, value: any, ttlSeconds?: number) {
    const stringValue = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, stringValue, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
