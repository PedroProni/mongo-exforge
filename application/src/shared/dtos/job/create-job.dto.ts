import { ExportFormat } from '@domain/enums/all.enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({ description: 'Name of the job' })
  @IsString()
  readonly name!: string;

  @ApiProperty({ description: 'Conversion format', enum: ExportFormat })
  @IsEnum(ExportFormat)
  readonly export_format!: ExportFormat;

  @ApiProperty({ description: 'Collection name' })
  @IsString()
  readonly collection!: string;

  @ApiProperty({ description: 'Query to filter documents' })
  @IsString()
  readonly query!: string;

  @ApiProperty({ description: 'Fields to include in the export', type: [String], required: false })
  @IsOptional()
  @IsString({ each: true })
  readonly fields?: string[];

  @ApiProperty({ description: 'Sorting criteria', type: Object, required: false })
  @IsOptional()
  readonly sort?: Record<string, 'asc' | 'desc'>;
}
