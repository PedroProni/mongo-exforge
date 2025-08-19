import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SendJobProducer {
  constructor(@InjectQueue('send-job') private readonly queue: Queue) {}
  async enqueue(payload: any): Promise<void> {
    const job_options = {
      jobId: String(payload.jobId),
      removeOnComplete: false,
      removeOnFail: false,
      attempts: 2,
      backoff: { type: 'exponential', delay: 5000 },
      stacktraceLimit: 5,
      tags: ['user_id', payload.id || 'unknown'],
    };

    await this.queue.add('send-job', { payload }, job_options);
  }
}
