import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { ExportRejectedError } from '@application/errors/export-rejected.error';
import { JobInputResolverService } from '@application/services/job-input-resolver.service';
import { SourceGroupService } from '@application/services/source-group.service';
import { PreviewSourceUseCase } from '@application/use-cases/mongo/preview-source.use-case';
import { PREVIEW_MAX_GROUPS, PREVIEW_ROW_LIMIT } from '@domain/constants/preview.constant';
import { QueryOperator } from '@domain/enums/query-operator.enum';
import { MongoRepository } from '@domain/repositories/mongo.repository';

describe('PreviewSourceUseCase', () => {
  const user = { id: 'user-1', email: 'a@test.dev' };
  const input = { query: [{ connection_id: 'conn-1', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 30 }], fields: ['name'], sort: { age: -1 as const } };
  const resolved = [{ uri: 'enc', connection_id: 'conn-1', collection: 'people', field: 'age', operator: QueryOperator.GTE, value: 30 }];

  function build(preview: jest.Mock, groups = 1) {
    const resolve = jest.fn().mockResolvedValue(resolved);
    const sourceGroups = { build: jest.fn().mockReturnValue(Array.from({ length: groups }, () => ({}))) } as unknown as SourceGroupService;
    return { useCase: new PreviewSourceUseCase({ preview } as unknown as MongoRepository, { resolve } as unknown as JobInputResolverService, sourceGroups), resolve };
  }

  it('validates like an export and reads at most the preview row limit', async () => {
    const preview = jest.fn().mockResolvedValue({ rows: [], columns: [], estimated_total: 0, estimate_capped: false });
    const { useCase, resolve } = build(preview);
    await useCase.execute(user, input);
    expect(resolve).toHaveBeenCalledWith(user, { query: input.query, max_rows: 0 });
    expect(preview.mock.calls[0][0]).toMatchObject({ fields: ['name'], sort: { age: -1 }, limit: PREVIEW_ROW_LIMIT });
  });

  it('refuses more sources than the preview allows without reading anything', async () => {
    const preview = jest.fn();
    const { useCase } = build(preview, PREVIEW_MAX_GROUPS + 1);
    await expect(useCase.execute(user, input)).rejects.toBeInstanceOf(BadRequestException);
    expect(preview).not.toHaveBeenCalled();
  });

  it('turns a rejected source into a bad request and other failures into a bad gateway', async () => {
    const rejected = build(jest.fn().mockRejectedValue(new ExportRejectedError('Field not allowed')));
    await expect(rejected.useCase.execute(user, input)).rejects.toBeInstanceOf(BadRequestException);
    const failed = build(jest.fn().mockRejectedValue(new Error('socket timeout')));
    await expect(failed.useCase.execute(user, input)).rejects.toBeInstanceOf(BadGatewayException);
  });
});
