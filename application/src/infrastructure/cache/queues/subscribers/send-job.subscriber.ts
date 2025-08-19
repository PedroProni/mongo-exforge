import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Injectable()
@Processor('send-job')
export class SendJobSubscriber extends WorkerHost {
  constructor() {
    super();
  }

  async process(job: Job<{ payload: any }>): Promise<void> {
    const payload = job.data.payload;

    console.log(payload);
  }
}
