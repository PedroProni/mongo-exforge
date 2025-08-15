import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '@application/use-cases/user/create-user.use-case';
import { FindUsersUseCase } from '@application/use-cases/user/find-users.use-case';
import { LoginUserUseCase } from '@application/use-cases/user/login-user.use-case';
import { UpdateUserUseCase } from '@application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '@application/use-cases/user/delete-user.use-case';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '@shared/dtos/export-all.dto';
import { ApplicationUserMapper } from '@application/mappers/user.mapper';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findUsersUseCase: FindUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    const command = ApplicationUserMapper.toCreateUserCommand(createUserDto);
    return this.createUserUseCase.execute(command);
  }

  @Get()
  @ApiOperation({ summary: 'Get users using query parameters' })
  async findAll(@Query('page') page: number, @Query('limit') limit: number, @Query('id') id: string, @Query('email') email: string) {
    return this.findUsersUseCase.execute(page, limit, id, email);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const command = ApplicationUserMapper.toUpdateUserCommand(updateUserDto, id);
    return this.updateUserUseCase.execute(command);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  async delete(@Param('id') id: string) {
    return this.deleteUserUseCase.execute(id);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  async login(@Body() loginUserDto: LoginUserDto) {
    const command = ApplicationUserMapper.toLoginUserCommand(loginUserDto);
    return this.loginUserUseCase.execute(command);
  }
}
