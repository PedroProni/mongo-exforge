import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InspectSourcesUseCase } from '@application/use-cases/mongo/inspect-sources.use-case';
import { SWAGGER_BEARER_NAME } from '@infrastructure/documentation/config/swagger-constants.config';
import { CollectionPresenter } from '@presentation/presenters/collection.presenter';
import { CollectionInfo } from '@domain/types/collection-info.type';
import { InspectSourcesDto } from '@shared/dtos/mongo/inspect-sources.dto';

@ApiTags('Mongo')
@ApiBearerAuth(SWAGGER_BEARER_NAME)
@Controller('mongo')
export class MongoController {
  constructor(private readonly inspectSourcesUseCase: InspectSourcesUseCase) {}

  @Post('inspect')
  @ApiOperation({ summary: 'List the collections and sampled fields of MongoDB sources' })
  @HttpCode(HttpStatus.OK)
  async inspect(@Body() dto: InspectSourcesDto): Promise<CollectionInfo[]> {
    return (await this.inspectSourcesUseCase.execute(dto.uris)).map(item => CollectionPresenter.toResponse(item));
  }
}
