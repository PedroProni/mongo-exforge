import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('send-job')
export class SendJobProcessor {
  async handle(job: Job) {
    const { jobId, userId } = job.data;
    try {
      // Your job logic here:
      // - Fetch job data
      // - Run getSourceMongoData
      // - Generate export file
      // - Update job status
      console.log(`Processing job ${jobId} for user ${userId}`);
      // TODO: Implement actual processing logic
    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
      throw error; // BullMQ will handle retries/DLQ
    }
  }
}
