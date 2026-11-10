import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';
import { MAX_PASSWORD_LENGTH } from '@domain/constants/auth.constant';

export class LoginUserDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(254)
  readonly email!: string;

  @ApiProperty({ example: 'a-strong-password' })
  @IsString()
  @MaxLength(MAX_PASSWORD_LENGTH)
  readonly password!: string;
}
