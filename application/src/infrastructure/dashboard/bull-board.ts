import { INestApplication, Logger } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { basicAuthMiddleware } from '@infrastructure/dashboard/bull-board.auth';
import { BULL_BOARD_PATH, EXPORT_QUEUE_NAME } from '@domain/constants/queue.constant';

export function setupBullBoard(app: INestApplication, envConfigService: EnvConfigService): void {
  const logger = new Logger('BullBoard');
  const username = envConfigService.getBasicAuthUsername();
  const password = envConfigService.getBasicAuthPassword();

  if (!username || !password) {
    logger.warn('BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are not set: Bull Board is disabled');
    return;
  }

  const server_adapter = new ExpressAdapter();
  server_adapter.setBasePath(BULL_BOARD_PATH);
  createBullBoard({ queues: [new BullMQAdapter(app.get<Queue>(getQueueToken(EXPORT_QUEUE_NAME)))], serverAdapter: server_adapter });
  app.use(BULL_BOARD_PATH, basicAuthMiddleware(username, password), server_adapter.getRouter());
}
