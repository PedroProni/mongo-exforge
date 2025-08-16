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

  async set(key: string, value: any, ttl_seconds?: number) {
    const string_value = JSON.stringify(value);
    if (ttl_seconds) {
      await this.client.set(key, string_value, 'EX', ttl_seconds);
    } else {
      await this.client.set(key, string_value);
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
