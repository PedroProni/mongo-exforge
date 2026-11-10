import { Controller, Get, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, HealthIndicatorService, MongooseHealthIndicator } from '@nestjs/terminus';
import { Queue } from 'bullmq';
import { Public } from '@infrastructure/auth/decorators/public.decorator';
import { EXPORT_QUEUE_NAME } from '@domain/constants/queue.constant';
import { StoragePort } from '@domain/ports/storage.port';
import { STORAGE_INJECT_TOKEN } from '@domain/tokens/inject.token';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongooseIndicator: MongooseHealthIndicator,
    private readonly indicatorService: HealthIndicatorService,
    @InjectQueue(EXPORT_QUEUE_NAME) private readonly queue: Queue,
    @Inject(STORAGE_INJECT_TOKEN) private readonly storage: StoragePort,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Check the application status' })
  @HealthCheck()
  healthCheck() {
    return this.health.check([() => this.mongooseIndicator.pingCheck('mongodb'), () => this.probe('redis', () => this.queue.waitUntilReady()), () => this.probe('storage', () => this.storage.ping())]);
  }

  private async probe(key: string, action: () => Promise<unknown>) {
    const indicator = this.indicatorService.check(key);
    try {
      await action();
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: (error as Error).message });
    }
  }
}
