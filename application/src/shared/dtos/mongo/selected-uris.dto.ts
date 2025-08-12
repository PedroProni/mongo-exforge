import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SelectedURIsDto {
  @ApiProperty({ description: 'selected mongo URIs' })
  @IsString({ each: true })
  readonly uris!: string[];
}
