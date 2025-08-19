import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SendJobProducer {
  constructor(@InjectQueue('sended-job-queue') private readonly queue: Queue) {}

  async enqueue(payload: any): Promise<void> {
    const jobOptions = {
      jobId: String(payload.id),
      removeOnComplete: false,
      removeOnFail: false,
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
      stacktraceLimit: 5,
      tags: ['user_id', payload.id || 'unknown'],
    };

    await this.queue.add('sended-job-queue', { payload }, jobOptions);
  }
}
