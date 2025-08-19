import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JOB_INJECT_TOKEN } from '@domain/tokens/inject.token';
import { JobEntity } from '@domain/entities/job.entity';
import { JobRepository } from '@domain/repositories/job.repository';
import { CreateJobCommand } from '@application/commands/job/create-job.command';
import { ApplicationJobMapper } from '@application/mappers/job.mapper';
import { SendJobProducer } from '@infrastructure/cache/queues/producers/send-job.producer';

@Injectable()
export class CreateJobUseCase {
  constructor(
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    private readonly jwtService: JwtService,
    private readonly sendJobProducer: SendJobProducer,
  ) {}

  async execute(command: CreateJobCommand, user_token: string): Promise<JobEntity> {
    const { id } = this.jwtService.verify(user_token);
    const job = ApplicationJobMapper.toEntity(command, id);
    const created_job = await this.jobRepository.create(job);

    await this.sendJobProducer.enqueue({
      jobId: created_job.getId(),
      command,
      userId: id,
    });

    // const data = await this.jobRepository.getSourceMongoData(job);
    // let url: string = '';
    // if (data.length > 0) url = await this.exportService.generateExportFile(data, command.export_format, command.name);
    return created_job;
  }
}
