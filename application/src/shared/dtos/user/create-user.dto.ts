import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@domain/constants/auth.constant';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(1, MAX_NAME_LENGTH)
  readonly name!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Length(1, MAX_NAME_LENGTH)
  readonly surname!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(254)
  readonly email!: string;

  @ApiProperty({ example: 'a-strong-password', minLength: MIN_PASSWORD_LENGTH, maxLength: MAX_PASSWORD_LENGTH })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  readonly password!: string;
}
