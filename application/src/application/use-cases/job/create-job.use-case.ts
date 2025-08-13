import { Injectable, Inject } from '@nestjs/common';
import { JOB_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { CreateJobCommand } from '@application/commands/job/create-job.command';
import { JobEntity } from '@domain/entities/job.entity';
import { JobRepository } from '@domain/repositories/job.repository';
import { ApplicationJobMapper } from '@application/mappers/job.mapper';
import { ExportService } from '@application/services/export.service';

@Injectable()
export class CreateJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    private readonly exportService: ExportService,
  ) {}

  async execute(command: CreateJobCommand): Promise<JobEntity> {
    const job = ApplicationJobMapper.toEntity(command);
    const data = await this.jobRepository.getSourceMongoData(job);
    let url: string | undefined = undefined;
    if (data.length > 0) url = await this.exportService.generateExportFile(data, command.export_format, command.name);
    return this.jobRepository.create(job, url);
  }
}
