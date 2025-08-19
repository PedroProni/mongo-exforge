import { Global, Module, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { Redis } from 'ioredis';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { EnvConfigModule } from '@common/env/env-config.module';

const logger = new Logger('QueueConfigModule');
@Global()
@Module({
  imports: [
    EnvConfigModule,
    BullModule.forRootAsync({
      imports: [EnvConfigModule],
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => {
        const host = env.getRedisHost();
        const port = env.getRedisPort();

        logger.log(`Trying to connect to Redis at ${host}:${port}`);

        const redis = new Redis({
          host,
          port,
          maxRetriesPerRequest: null,
          retryStrategy: retries => {
            const delay = Math.min(retries * 1000, 10000);
            logger.warn(`Redis not available, retrying in ${delay}ms (attempt #${retries})`);
            return delay;
          },
        });

        redis.on('ready', () => {
          logger.log('Redis connection established');
        });

        redis.on('error', err => {
          logger.error('Redis error:', err.message);
        });

        return {
          connection: redis,
        };
      },
    }),
    BullModule.registerQueue(
      { name: 'received-databricks-api' },
      { name: 'failed-received-users' },
      { name: 'sended-smartico-api' },
      { name: 'failed-sended-users' },
      { name: 'failed-received-requests' },
      { name: 'bonus-request-received' },
      { name: 'sended-bonus-request-mission' },
      { name: 'sended-bonus-request-campaign' },
      { name: 'sended-bonus-request-tournament' },
      { name: 'sended-bonus-request-minigames' },
      { name: 'sended-bonus-request-trails' },
      { name: 'sended-bonus-request-external' },
      { name: 'sended-bonus-request-refer-friend' },
    ),
  ],
  exports: [BullModule],
})
export class QueueConfigModule {}
