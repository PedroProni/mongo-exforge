import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateConnectionUseCase } from '@application/use-cases/connection/create-connection.use-case';
import { DeleteConnectionUseCase } from '@application/use-cases/connection/delete-connection.use-case';
import { InspectConnectionUseCase } from '@application/use-cases/connection/inspect-connection.use-case';
import { ListConnectionsUseCase } from '@application/use-cases/connection/list-connections.use-case';
import { InspectSourcesUseCase } from '@application/use-cases/mongo/inspect-sources.use-case';
import { CurrentUser } from '@infrastructure/auth/decorators/current-user.decorator';
import { SWAGGER_BEARER_NAME } from '@infrastructure/documentation/config/swagger-constants.config';
import { CollectionPresenter } from '@presentation/presenters/collection.presenter';
import { ConnectionPresenter } from '@presentation/presenters/connection.presenter';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { CollectionInfo } from '@domain/types/collection-info.type';
import { CreateConnectionDto } from '@shared/dtos/connection/create-connection.dto';
import { TestConnectionDto } from '@shared/dtos/connection/test-connection.dto';
import { ConnectionResponse } from '@shared/responses/connection-response.type';

@ApiTags('Connection')
@ApiBearerAuth(SWAGGER_BEARER_NAME)
@Controller('connection')
export class ConnectionController {
  constructor(
    private readonly createConnectionUseCase: CreateConnectionUseCase,
    private readonly listConnectionsUseCase: ListConnectionsUseCase,
    private readonly deleteConnectionUseCase: DeleteConnectionUseCase,
    private readonly inspectConnectionUseCase: InspectConnectionUseCase,
    private readonly inspectSourcesUseCase: InspectSourcesUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Save a MongoDB connection (the URI is stored encrypted and returned masked)' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateConnectionDto): Promise<ConnectionResponse> {
    return ConnectionPresenter.toResponse(await this.createConnectionUseCase.execute(user, { name: dto.name, uri: dto.uri }));
  }

  @Get()
  @ApiOperation({ summary: 'List your saved connections' })
  async list(@CurrentUser() user: AuthenticatedUser): Promise<ConnectionResponse[]> {
    return (await this.listConnectionsUseCase.execute(user)).map(item => ConnectionPresenter.toResponse(item));
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test a URI without saving it' })
  async test(@Body() dto: TestConnectionDto): Promise<{ ok: boolean; collections: number }> {
    const collections = await this.inspectSourcesUseCase.execute([dto.uri]);
    return { ok: true, collections: collections.length };
  }

  @Get(':id/collections')
  @ApiOperation({ summary: 'List the collections and sampled fields of a saved connection' })
  async collections(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<CollectionInfo[]> {
    return (await this.inspectConnectionUseCase.execute(user, id)).map(item => CollectionPresenter.toResponse(item));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved connection' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteConnectionUseCase.execute(user, id);
  }
}
