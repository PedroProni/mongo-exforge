import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, MaxLength } from 'class-validator';
import { MAX_INSPECT_URIS, MAX_URI_LENGTH } from '@domain/constants/query-validation.constant';

export class InspectSourcesDto {
  @ApiProperty({ description: 'MongoDB connection URIs to inspect', example: ['mongodb://host:27017/db1'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_INSPECT_URIS)
  @IsString({ each: true })
  @MaxLength(MAX_URI_LENGTH, { each: true })
  readonly uris!: string[];
}
