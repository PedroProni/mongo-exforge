import { CreateJobCommand } from '@application/commands/job/create-job.command';
import { JobEntity } from '@domain/entities/job.entity';
import { ApplicationQueryMapper } from './complements/query.mapper';

export class ApplicationJobMapper {
  static toCreateJobCommand(data: any): CreateJobCommand {
    return new CreateJobCommand('', '', data.name, data.status, data.export_format, data.join_field, data.query, data.fields, data.sort, '');
  }
  static toEntity(command: any, user_id?: string): JobEntity {
    return new JobEntity({
      _id: command.id,
      user_id: user_id ? user_id : command.user_id,
      name: command.name,
      status: command.status,
      export_format: command.export_format,
      join_field: command.join_field,
      query: command.query.map(ApplicationQueryMapper.toEntity),
      fields: command.fields,
      sort: command.sort,
      file_url: command.file_url,
      created_at: command.created_at,
      updated_at: command.updated_at,
    });
  }
}
