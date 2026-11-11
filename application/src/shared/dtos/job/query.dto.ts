import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { COLLECTION_NAME_PATTERN, MAX_URI_LENGTH } from '@domain/constants/query-validation.constant';
import { QueryOperator } from '@domain/enums/query-operator.enum';
import { QueryValue } from '@domain/types/query-value.type';
import { IsFieldPath } from '@shared/validators/is-field-path.validator';
import { IsQueryValue } from '@shared/validators/is-query-value.validator';

export class QueryDto {
  @ApiPropertyOptional({ description: 'MongoDB connection URI of the source (must include the database name). Use this or connection_id', example: 'mongodb://user:pass@host:27017/mydb' })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_URI_LENGTH)
  readonly uri?: string;

  @ApiPropertyOptional({ description: 'Id of one of your saved connections. Use this or uri' })
  @IsOptional()
  @IsUUID()
  readonly connection_id?: string;

  @ApiProperty({ description: 'Collection to read', example: 'users' })
  @IsString()
  @Matches(COLLECTION_NAME_PATTERN, { message: 'collection must be a plain collection name' })
  readonly collection!: string;

  @ApiProperty({ description: 'Field to filter on', example: 'age' })
  @IsFieldPath()
  readonly field!: string;

  @ApiProperty({ description: 'Comparison operator', enum: QueryOperator, example: QueryOperator.GTE })
  @IsEnum(QueryOperator)
  readonly operator!: QueryOperator;

  @ApiProperty({ description: 'Scalar value, or an array of scalars for in and nin', example: 18 })
  @IsQueryValue()
  readonly value!: QueryValue;
}
