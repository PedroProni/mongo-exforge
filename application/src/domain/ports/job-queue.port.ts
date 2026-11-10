export interface JobQueuePort {
  enqueue(job_id: string): Promise<void>;
}
