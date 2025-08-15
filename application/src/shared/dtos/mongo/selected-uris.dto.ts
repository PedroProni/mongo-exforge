import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SelectedURIsDto {
  @ApiProperty({ description: 'Indicates whether the user wants to be remembered for future sessions.', example: true })
  readonly remember_me!: boolean;

  @ApiProperty({ description: 'List of selected MongoDB connection URIs.', example: ['mongodb://localhost:27017/db1', 'mongodb://example.com:27017/db2'] })
  @IsString({ each: true })
  readonly uris!: string[];
}
