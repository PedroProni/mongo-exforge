import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { MAX_URI_LENGTH } from '@domain/constants/query-validation.constant';

export class TestConnectionDto {
  @ApiProperty({ example: 'mongodb://user:pass@host:27017/mydb' })
  @IsString()
  @MaxLength(MAX_URI_LENGTH)
  readonly uri!: string;
}
