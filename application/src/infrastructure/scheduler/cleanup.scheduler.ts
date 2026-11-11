import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CleanupExpiredExportsUseCase } from '@application/use-cases/job/cleanup-expired-exports.use-case';
import { EXPORT_CLEANUP_CRON } from '@domain/constants/env.constant';

@Injectable()
export class CleanupScheduler {
  private readonly logger = new Logger(CleanupScheduler.name);
  private running = false;

  constructor(private readonly cleanupExpiredExportsUseCase: CleanupExpiredExportsUseCase) {}

  @Cron(EXPORT_CLEANUP_CRON)
  async sweep(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const removed = await this.cleanupExpiredExportsUseCase.execute();
      if (removed > 0) this.logger.log(`Removed ${removed} expired export files`);
    } catch (error) {
      this.logger.error(`Cleanup sweep failed: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
