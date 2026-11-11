import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';
import { MAX_NAME_LENGTH } from '@domain/constants/auth.constant';
import { MAX_QUERY_FILTERS, MAX_SELECTED_FIELDS } from '@domain/constants/query-validation.constant';
import { ExportFormat } from '@domain/enums/export-format.enum';
import { SortDirection } from '@domain/enums/sort-direction.enum';
import { QueryDto } from '@shared/dtos/job/query.dto';
import { IsFieldPath } from '@shared/validators/is-field-path.validator';
import { IsSortMap } from '@shared/validators/is-sort-map.validator';

export class CreateJobDto {
  @ApiProperty({ description: 'Name of the export', example: 'Adult users' })
  @IsString()
  @Length(1, MAX_NAME_LENGTH)
  readonly name!: string;

  @ApiProperty({ description: 'Output format', enum: ExportFormat, example: ExportFormat.CSV })
  @IsEnum(ExportFormat)
  readonly export_format!: ExportFormat;

  @ApiProperty({ description: 'Sources and filters. Items with the same uri and collection are combined with AND; different sources are concatenated.', type: [QueryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_QUERY_FILTERS)
  @ValidateNested({ each: true })
  @Type(() => QueryDto)
  readonly query!: QueryDto[];

  @ApiProperty({ description: 'Fields to include (all fields when omitted)', type: [String], required: false, example: ['name', 'email'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_SELECTED_FIELDS)
  @IsFieldPath({ each: true })
  readonly fields?: string[];

  @ApiProperty({ description: 'Maximum number of rows to export (the server cap applies when omitted)', required: false, example: 10000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly max_rows?: number;

  @ApiProperty({ description: 'Sort order', type: Object, required: false, example: { created_at: SortDirection.DESC } })
  @IsOptional()
  @IsSortMap()
  readonly sort?: Record<string, SortDirection>;
}
