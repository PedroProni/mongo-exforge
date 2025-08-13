import { QueryOperator } from '@domain/enums/all.enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class QueryDto {
  @ApiProperty({ description: 'Name of the field to apply the filter on' })
  @IsString()
  readonly field!: string;

  @ApiProperty({ description: 'Operator to apply on the field', enum: [QueryOperator] })
  @IsEnum(QueryOperator)
  readonly operator!: QueryOperator;

  @ApiProperty({ description: 'Value to compare against' })
  @IsString()
  readonly value!: string;
}
