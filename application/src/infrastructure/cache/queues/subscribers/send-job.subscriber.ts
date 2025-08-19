import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobPersistence } from '@infrastructure/database/persistence/job.persistence';
import { EncryptionService } from '@application/services/encryption.service';
import { ExportService } from '@application/services/export.service';
import { DomainJobMapper } from '@domain/mappers/job.mapper';

@Injectable()
@Processor('send-job')
export class SendJobSubscriber extends WorkerHost {
  private readonly logger = new Logger(SendJobSubscriber.name);

  constructor(
    private readonly jobPersistence: JobPersistence,
    private readonly encryptionService: EncryptionService,
    private readonly exportService: ExportService,
  ) {
    super();
  }

  async process(job: Job<{ payload: any }>): Promise<void> {
    try {
      const payload = job.data.payload.command;
  
      payload.query = payload.query.map((q: any) => ({
        ...q,
        uri: this.encryptionService.decrypt(q.uri),
      }));
  
      const data = await this.jobPersistence.getSourceMongoData(DomainJobMapper.toDomain(payload));
      let url: string = '';
      if (data.length > 0) url = await this.exportService.generateExportFile(data, payload.export_format, payload.name);
      await this.jobPersistence.jobFile(payload._id, url);
    } catch (error) {
      this.logger.error('Error processing job:', error);
    }
  }
}
