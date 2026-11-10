import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MaxLength } from 'class-validator';
import { MAX_CONNECTION_NAME_LENGTH } from '@domain/constants/connection.constant';
import { MAX_URI_LENGTH } from '@domain/constants/query-validation.constant';

export class CreateConnectionDto {
  @ApiProperty({ example: 'Sample data' })
  @IsString()
  @Length(1, MAX_CONNECTION_NAME_LENGTH)
  readonly name!: string;

  @ApiProperty({ example: 'mongodb://user:pass@host:27017/mydb' })
  @IsString()
  @MaxLength(MAX_URI_LENGTH)
  readonly uri!: string;
}
