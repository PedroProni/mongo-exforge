import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { MAX_QUERY_FILTERS, MAX_SELECTED_FIELDS } from '@domain/constants/query-validation.constant';
import { SortDirection } from '@domain/enums/sort-direction.enum';
import { QueryDto } from '@shared/dtos/job/query.dto';
import { IsFieldPath } from '@shared/validators/is-field-path.validator';
import { IsSortMap } from '@shared/validators/is-sort-map.validator';

export class PreviewDto {
  @ApiProperty({ description: 'Sources and filters, same shape as an export', type: [QueryDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_QUERY_FILTERS)
  @ValidateNested({ each: true })
  @Type(() => QueryDto)
  readonly query!: QueryDto[];

  @ApiProperty({ description: 'Fields to include (all fields when omitted)', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_SELECTED_FIELDS)
  @IsFieldPath({ each: true })
  readonly fields?: string[];

  @ApiProperty({ description: 'Sort order', type: Object, required: false })
  @IsOptional()
  @IsSortMap()
  readonly sort?: Record<string, SortDirection>;
}
