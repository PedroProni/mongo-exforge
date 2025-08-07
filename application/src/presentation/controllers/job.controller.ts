import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateJobUseCase } from '@application/use-cases/job/create-job.use-case';
import { FindJobsUseCase } from '@application/use-cases/job/find-jobs.use.case';
import { ApplicationJobMapper } from '@application/mappers/job.mapper';
import { CreateJobDto } from '@shared/dtos/export-all.dto';

@ApiTags('Job')
@Controller('job')
export class JobController {
  constructor(
    private readonly createJobUseCase: CreateJobUseCase,
    private readonly findJobsUseCase: FindJobsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createJobDto: CreateJobDto) {
    const command = ApplicationJobMapper.toCreateJobCommand(createJobDto);
    return await this.createJobUseCase.execute(command);
  }

  @Get()
  @ApiOperation({ summary: 'Get jobs with pagination' })
  @HttpCode(HttpStatus.OK)
  async find(@Query('page') page: number = 1, @Query('limit') limit: number = 10, @Query('id') id?: string) {
    return await this.findJobsUseCase.execute(page, limit, id);
  }
}
