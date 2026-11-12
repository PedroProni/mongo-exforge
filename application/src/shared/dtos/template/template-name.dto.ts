import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { MAX_NAME_LENGTH } from '@domain/constants/auth.constant';

export class TemplateNameDto {
  @ApiProperty({ description: 'Template name', example: 'Weekly adult users' })
  @IsString()
  @Length(1, MAX_NAME_LENGTH)
  readonly name!: string;
}
