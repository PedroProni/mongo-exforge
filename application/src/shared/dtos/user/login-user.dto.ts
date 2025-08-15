import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the user' })
  @IsString()
  readonly email!: string;

  @ApiProperty({ example: 'password123', description: 'Password for the user account' })
  @IsString()
  readonly password!: string;
}
