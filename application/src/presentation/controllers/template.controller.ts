import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTemplateUseCase } from '@application/use-cases/template/create-template.use-case';
import { DeleteTemplateUseCase } from '@application/use-cases/template/delete-template.use-case';
import { ListTemplatesUseCase } from '@application/use-cases/template/list-templates.use-case';
import { RenameTemplateUseCase } from '@application/use-cases/template/rename-template.use-case';
import { RunTemplateUseCase } from '@application/use-cases/template/run-template.use-case';
import { CurrentUser } from '@infrastructure/auth/decorators/current-user.decorator';
import { SWAGGER_BEARER_NAME } from '@infrastructure/documentation/config/swagger-constants.config';
import { JobInputMapper } from '@presentation/mappers/job-input.mapper';
import { JobPresenter } from '@presentation/presenters/job.presenter';
import { TemplatePresenter } from '@presentation/presenters/template.presenter';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { CreateJobDto } from '@shared/dtos/job/create-job.dto';
import { RerunJobDto } from '@shared/dtos/job/rerun-job.dto';
import { TemplateNameDto } from '@shared/dtos/template/template-name.dto';
import { JobResponse } from '@shared/responses/job-response.type';
import { TemplateResponse } from '@shared/responses/template-response.type';

@ApiTags('Template')
@ApiBearerAuth(SWAGGER_BEARER_NAME)
@Controller('template')
export class TemplateController {
  constructor(
    private readonly createTemplateUseCase: CreateTemplateUseCase,
    private readonly listTemplatesUseCase: ListTemplatesUseCase,
    private readonly renameTemplateUseCase: RenameTemplateUseCase,
    private readonly deleteTemplateUseCase: DeleteTemplateUseCase,
    private readonly runTemplateUseCase: RunTemplateUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Save an export setup as a template' })
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateJobDto): Promise<TemplateResponse> {
    return TemplatePresenter.toResponse(await this.createTemplateUseCase.execute(user, JobInputMapper.toCreateJobInput(dto)));
  }

  @Get()
  @ApiOperation({ summary: 'List your templates' })
  async list(@CurrentUser() user: AuthenticatedUser): Promise<TemplateResponse[]> {
    return (await this.listTemplatesUseCase.execute(user)).map(item => TemplatePresenter.toResponse(item));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename one of your templates' })
  async rename(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: TemplateNameDto): Promise<TemplateResponse> {
    return TemplatePresenter.toResponse(await this.renameTemplateUseCase.execute(user, id, dto.name));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete one of your templates' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteTemplateUseCase.execute(user, id);
  }

  @Post(':id/run')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start an export from one of your templates' })
  async run(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: RerunJobDto): Promise<JobResponse> {
    return JobPresenter.toResponse(await this.runTemplateUseCase.execute(user, id, dto.name));
  }
}
