import { Queue } from 'bullmq';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { authMiddlewareFactory } from '@infrastructure/middlewares/bull-auth.middleware';

export function setupBullDashboard(queues: Queue[], envConfigService: EnvConfigService) {
  const server_adapter = new ExpressAdapter();

  server_adapter.setBasePath('/bull-board');
  server_adapter.getRouter().use(authMiddlewareFactory(envConfigService));

  const adapters = queues.map(queue => new BullMQAdapter(queue));

  createBullBoard({ queues: adapters, serverAdapter: server_adapter });

  return server_adapter;
}
