import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { MAX_SEARCH_LENGTH } from '@domain/constants/job-list.constant';
import { ExportStatus } from '@domain/enums/export-status.enum';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '@domain/constants/pagination.constant';

export class ListJobsDto {
  @ApiPropertyOptional({ default: DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = DEFAULT_PAGE;

  @ApiPropertyOptional({ default: DEFAULT_LIMIT, minimum: 1, maximum: MAX_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  readonly limit: number = DEFAULT_LIMIT;

  @ApiPropertyOptional({ enum: ExportStatus })
  @IsOptional()
  @IsEnum(ExportStatus)
  readonly status?: ExportStatus;

  @ApiPropertyOptional({ description: 'Case-insensitive search in the job name', maxLength: MAX_SEARCH_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_SEARCH_LENGTH)
  readonly q?: string;
}
