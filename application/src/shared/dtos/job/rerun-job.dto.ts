import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { MAX_NAME_LENGTH } from '@domain/constants/auth.constant';

export class RerunJobDto {
  @ApiPropertyOptional({ description: 'Name of the new export (the original name when omitted)' })
  @IsOptional()
  @IsString()
  @Length(1, MAX_NAME_LENGTH)
  readonly name?: string;
}
