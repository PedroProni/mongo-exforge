import { CreateJobCommand } from '@application/commands/job/create-job.command';
import { JobEntity } from '@domain/entities/job.entity';

export class ApplicationJobMapper {
  static toCreateJobCommand(data: any): CreateJobCommand {
    return new CreateJobCommand('', data.name, data.status, data.export_format, data.collection, data.query, data.fields, data.sort, data.file_url);
  }
  static toEntity(command: any): JobEntity {
    return new JobEntity({ _id: command.id, name: command.name, status: command.status, export_format: command.export_format, collection: command.collection, query: command.query, fields: command.fields, sort: command.sort, file_url: command.file_url, created_at: command.created_at, updated_at: command.updated_at });
  }
}
