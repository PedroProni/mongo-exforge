import { ConflictException, NotFoundException } from '@nestjs/common';
import { JobInputResolverService } from '@application/services/job-input-resolver.service';
import { StoredInputService } from '@application/services/stored-input.service';
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
import { CreateTemplateUseCase } from '@application/use-cases/template/create-template.use-case';
import { RunTemplateUseCase } from '@application/use-cases/template/run-template.use-case';
import { CreateTemplateFromJobUseCase } from '@application/use-cases/template/create-template-from-job.use-case';
import { DeleteTemplateUseCase } from '@application/use-cases/template/delete-template.use-case';
import { ListTemplatesUseCase } from '@application/use-cases/template/list-templates.use-case';
import { RenameTemplateUseCase } from '@application/use-cases/template/rename-template.use-case';
import { JobRepository } from '@domain/repositories/job.repository';
import { buildJob } from '../../../testing/job.factory';
import { EncryptionService } from '@application/services/encryption.service';
import { TemplateEntity } from '@domain/entities/template.entity';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { QueryOperator } from '@domain/enums/query-operator.enum';
import { TemplateRepository } from '@domain/repositories/template.repository';
import { MAX_TEMPLATES_PER_USER } from '@domain/constants/template.constant';
import { CreateJobInput } from '@domain/types/create-job-input.type';

describe('template use cases', () => {
  const user = { id: 'user-1', email: 'a@test.dev' };
  const input: CreateJobInput = {
    name: '  Weekly  ',
    export_format: ExportFormat.CSV,
    query: [{ connection_id: 'conn-1', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 30 }],
    fields: [],
    sort: {},
    max_rows: 0,
  };

  it('refuses a new template once the per-user cap is reached, before resolving anything', async () => {
    const resolve = jest.fn();
    const create = jest.fn();
    const useCase = new CreateTemplateUseCase(
      { countOwned: jest.fn().mockResolvedValue(MAX_TEMPLATES_PER_USER), create } as unknown as TemplateRepository,
      { resolve } as unknown as JobInputResolverService,
    );
    await expect(useCase.execute(user, input)).rejects.toBeInstanceOf(ConflictException);
    expect(resolve).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('runs the same validation as an export before saving and trims the name', async () => {
    const resolve = jest.fn().mockResolvedValue([{ uri: 'enc', connection_id: 'conn-1', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 30 }]);
    const create = jest.fn().mockImplementation(async template => template);
    const useCase = new CreateTemplateUseCase({ countOwned: jest.fn().mockResolvedValue(0), create } as unknown as TemplateRepository, { resolve } as unknown as JobInputResolverService);
    const template = await useCase.execute(user, input);
    expect(resolve).toHaveBeenCalledWith(user, input);
    expect(template.getName()).toBe('Weekly');
    expect(template.getQuery()[0].getConnectionId()).toBe('conn-1');
  });

  it('runs a template through the export creation path with the stored input rehydrated', async () => {
    const template = TemplateEntity.create({
      user_id: 'user-1',
      name: 'Weekly',
      export_format: ExportFormat.CSV,
      query: [
        { uri: 'enc(mongodb://inline.example.com/db)', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 30 },
        { uri: 'enc(mongodb://saved.example.com/db)', connection_id: 'conn-1', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 30 },
      ],
      fields: ['name'],
      sort: {},
      max_rows: 5,
    });
    const execute = jest.fn().mockResolvedValue('job');
    const encryption = { decrypt: (value: string) => value.replace(/^enc\(|\)$/g, '') } as unknown as EncryptionService;
    const useCase = new RunTemplateUseCase({ findOwned: jest.fn().mockResolvedValue(template) } as unknown as TemplateRepository, new StoredInputService(encryption), {
      execute,
    } as unknown as CreateJobUseCase);
    await useCase.execute(user, template.getId());
    const rehydrated = execute.mock.calls[0][1] as CreateJobInput;
    expect(execute.mock.calls[0][0]).toBe(user);
    expect(rehydrated.name).toBe('Weekly');
    expect(rehydrated.query[0]).toMatchObject({ uri: 'mongodb://inline.example.com/db' });
    expect(rehydrated.query[0].connection_id).toBeUndefined();
    expect(rehydrated.query[1]).toMatchObject({ connection_id: 'conn-1' });
    expect(rehydrated.query[1].uri).toBeUndefined();
    expect(rehydrated.max_rows).toBe(5);
  });

  it('answers not found for a template that is not owned', async () => {
    const useCase = new RunTemplateUseCase({ findOwned: jest.fn().mockResolvedValue(null) } as unknown as TemplateRepository, {} as StoredInputService, {} as CreateJobUseCase);
    await expect(useCase.execute(user, 'x')).rejects.toBeInstanceOf(NotFoundException);
  });
  it('saves a past export as a template through the same validation, only for its owner', async () => {
    const job = buildJob({
      query: [{ uri: 'enc(mongodb://saved.example.com/db)', connection_id: 'conn-1', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 30 }],
      fields: ['name'],
      max_rows: 7,
    });
    const findOwned = jest.fn().mockResolvedValueOnce(job).mockResolvedValueOnce(null);
    const execute = jest.fn().mockResolvedValue('template');
    const encryption = { decrypt: (value: string) => value.replace(/^enc\(|\)$/g, '') } as unknown as EncryptionService;
    const useCase = new CreateTemplateFromJobUseCase({ findOwned } as unknown as JobRepository, new StoredInputService(encryption), { execute } as unknown as CreateTemplateUseCase);
    await useCase.execute(user, 'job-1', 'From job');
    expect(findOwned).toHaveBeenCalledWith('user-1', 'job-1');
    expect(execute.mock.calls[0][1]).toMatchObject({ name: 'From job', fields: ['name'], max_rows: 7, query: [{ connection_id: 'conn-1' }] });
    await expect(useCase.execute(user, 'job-2', 'Other')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists only the templates of the caller', async () => {
    const listOwned = jest.fn().mockResolvedValue([]);
    await new ListTemplatesUseCase({ listOwned } as unknown as TemplateRepository).execute(user);
    expect(listOwned).toHaveBeenCalledWith('user-1');
  });

  it('renames an owned template with a trimmed name and refuses a foreign one', async () => {
    const template = TemplateEntity.create({ user_id: 'user-1', name: 'Old', export_format: ExportFormat.CSV, query: [], fields: [], sort: {}, max_rows: 0 });
    const renameOwned = jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const useCase = new RenameTemplateUseCase({ renameOwned, findOwned: jest.fn().mockResolvedValue(template) } as unknown as TemplateRepository);
    await expect(useCase.execute(user, 'tpl', '  New  ')).resolves.toBe(template);
    expect(renameOwned).toHaveBeenCalledWith('user-1', 'tpl', 'New');
    await expect(useCase.execute(user, 'tpl', 'New')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes an owned template and answers not found otherwise', async () => {
    const deleteOwned = jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const useCase = new DeleteTemplateUseCase({ deleteOwned } as unknown as TemplateRepository);
    await expect(useCase.execute(user, 'tpl')).resolves.toBeUndefined();
    await expect(useCase.execute(user, 'tpl')).rejects.toBeInstanceOf(NotFoundException);
  });
});
