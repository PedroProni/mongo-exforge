import { BadRequestException, BadGatewayException, Inject, Injectable, Logger } from '@nestjs/common';
import { JobInputResolverService } from '@application/services/job-input-resolver.service';
import { SourceGroupService } from '@application/services/source-group.service';
import { ExportRejectedError } from '@application/errors/export-rejected.error';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { MONGO_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { PREVIEW_MAX_GROUPS, PREVIEW_ROW_LIMIT } from '@domain/constants/preview.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { PreviewInput } from '@domain/types/preview-input.type';
import { PreviewResult } from '@domain/types/preview-result.type';

@Injectable()
export class PreviewSourceUseCase {
  private readonly logger = new Logger(PreviewSourceUseCase.name);

  constructor(
    @Inject(MONGO_INJECT_TOKEN) private readonly mongoRepository: MongoRepository,
    private readonly jobInputResolver: JobInputResolverService,
    private readonly sourceGroupService: SourceGroupService,
  ) {}

  async execute(user: AuthenticatedUser, input: PreviewInput): Promise<PreviewResult> {
    const query = await this.jobInputResolver.resolve(user, { query: input.query, max_rows: 0 });
    const groups = this.sourceGroupService.build(query);
    if (groups.length > PREVIEW_MAX_GROUPS) throw new BadRequestException(`A preview supports at most ${PREVIEW_MAX_GROUPS} sources`);
    try {
      return await this.mongoRepository.preview({ groups, fields: input.fields, sort: input.sort, limit: PREVIEW_ROW_LIMIT });
    } catch (error) {
      if (error instanceof ExportRejectedError) throw new BadRequestException(error.message);
      this.logger.warn(`Preview failed: ${(error as Error).message}`);
      throw new BadGatewayException('Could not read the MongoDB source');
    }
  }
}
