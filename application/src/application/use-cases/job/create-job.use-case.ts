import { Injectable, Inject } from '@nestjs/common';
import { JOB_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { CreateJobCommand } from '@application/commands/job/create-job.command';
import { JobEntity } from '@domain/entities/job.entity';
import { JobRepository } from '@domain/repositories/job.repository';
import { ApplicationJobMapper } from '@application/mappers/job.mapper';
import { ExportService } from '@application/services/export.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CreateJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    private readonly exportService: ExportService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: CreateJobCommand, user_token: string): Promise<JobEntity> {
    const { id } = this.jwtService.verify(user_token);
    const job = ApplicationJobMapper.toEntity(command, id);
    const created_job = await this.jobRepository.create(job);
    const data = await this.jobRepository.getSourceMongoData(job);
    let url: string = '';
    if (data.length > 0) url = await this.exportService.generateExportFile(data, command.export_format, command.name);
    console.log(url)
    return created_job;
  }
}
