import { ExportFormat } from '@domain/enums/all.enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { QueryDto } from '../complements/query.dto';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty({ description: 'Name of the job', example: 'Export Users' })
  @IsString()
  readonly name!: string;

  @ApiProperty({ description: 'Conversion format', enum: ExportFormat, example: ExportFormat.CSV })
  @IsEnum(ExportFormat)
  readonly export_format!: ExportFormat;

  @ApiProperty({ description: 'Collection name', example: 'users' })
  @IsString()
  readonly collection!: string;

  @ApiProperty({ description: 'Query to filter documents', example: [{ field: 'age', operator: 'gte', value: 18 }] })
  @ValidateNested({ each: true })
  @Type(() => QueryDto)
  @IsArray()
  readonly query!: QueryDto[];

  @ApiProperty({ description: 'Fields to include in the export', type: [String], required: false, example: ['name', 'email', 'age'] })
  @IsOptional()
  @IsString({ each: true })
  readonly fields?: string[];

  @ApiProperty({ description: 'Sorting criteria', type: Object, required: false, example: { updated_at: 'desc' } })
  @IsOptional()
  readonly sort?: Record<string, 'asc' | 'desc'>;
}
