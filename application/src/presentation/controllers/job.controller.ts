import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Redirect, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
import { DeleteJobUseCase } from '@application/use-cases/job/delete-job.use-case';
import { DownloadJobUseCase } from '@application/use-cases/job/download-job.use-case';
import { FindJobUseCase } from '@application/use-cases/job/find-job.use-case';
import { FindJobsUseCase } from '@application/use-cases/job/find-jobs.use-case';
import { CurrentUser } from '@infrastructure/auth/decorators/current-user.decorator';
import { SWAGGER_BEARER_NAME } from '@infrastructure/documentation/config/swagger-constants.config';
import { JobInputMapper } from '@presentation/mappers/job-input.mapper';
import { JobPresenter } from '@presentation/presenters/job.presenter';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { Page } from '@domain/types/page.type';
import { CreateJobDto } from '@shared/dtos/job/create-job.dto';
import { ListJobsDto } from '@shared/dtos/job/list-jobs.dto';
import { JobResponse } from '@shared/responses/job-response.type';

@ApiTags('Job')
@ApiBearerAuth(SWAGGER_BEARER_NAME)
@Controller('job')
export class JobController {
  constructor(
    private readonly createJobUseCase: CreateJobUseCase,
    private readonly findJobsUseCase: FindJobsUseCase,
    private readonly findJobUseCase: FindJobUseCase,
    private readonly downloadJobUseCase: DownloadJobUseCase,
    private readonly deleteJobUseCase: DeleteJobUseCase,
  ) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Create an export job' })
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateJobDto): Promise<JobResponse> {
    return JobPresenter.toResponse(await this.createJobUseCase.execute(user, JobInputMapper.toCreateJobInput(dto)));
  }

  @Get()
  @ApiOperation({ summary: 'List your jobs' })
  async list(@CurrentUser() user: AuthenticatedUser, @Query() query: ListJobsDto): Promise<Page<JobResponse>> {
    return JobPresenter.toPage(await this.findJobsUseCase.execute(user, { page: query.page, limit: query.limit }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get the status, progress and error of one of your jobs' })
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<JobResponse> {
    return JobPresenter.toResponse(await this.findJobUseCase.execute(user, id));
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get a presigned download URL that is valid for 5 minutes' })
  async downloadUrl(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<{ url: string }> {
    return { url: await this.downloadJobUseCase.execute(user, id) };
  }

  @Get(':id/download')
  @Redirect()
  @ApiOperation({ summary: 'Redirect (302) to a presigned download URL that is valid for 5 minutes' })
  async download(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<{ url: string; statusCode: number }> {
    return { url: await this.downloadJobUseCase.execute(user, id), statusCode: HttpStatus.FOUND };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a finished job and its file' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.deleteJobUseCase.execute(user, id);
  }
}
