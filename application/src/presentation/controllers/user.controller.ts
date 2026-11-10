import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '@application/use-cases/user/create-user.use-case';
import { DeleteMeUseCase } from '@application/use-cases/user/delete-me.use-case';
import { GetMeUseCase } from '@application/use-cases/user/get-me.use-case';
import { LoginUserUseCase } from '@application/use-cases/user/login-user.use-case';
import { UpdateMeUseCase } from '@application/use-cases/user/update-me.use-case';
import { CurrentUser } from '@infrastructure/auth/decorators/current-user.decorator';
import { Public } from '@infrastructure/auth/decorators/public.decorator';
import { SWAGGER_BEARER_NAME } from '@infrastructure/documentation/config/swagger-constants.config';
import { UserPresenter } from '@presentation/presenters/user.presenter';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { CreateUserDto } from '@shared/dtos/user/create-user.dto';
import { LoginUserDto } from '@shared/dtos/user/login-user.dto';
import { UpdateUserDto } from '@shared/dtos/user/update-user.dto';
import { UserResponse } from '@shared/responses/user-response.type';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMeUseCase: UpdateMeUseCase,
    private readonly deleteMeUseCase: DeleteMeUseCase,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Sign up and receive a bearer token' })
  signUp(@Body() dto: CreateUserDto): Promise<{ token: string }> {
    return this.createUserUseCase.execute({ name: dto.name, surname: dto.surname, email: dto.email, password: dto.password });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in and receive a bearer token' })
  login(@Body() dto: LoginUserDto): Promise<{ token: string }> {
    return this.loginUserUseCase.execute(dto.email, dto.password);
  }

  @Get('me')
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({ summary: 'Get your account' })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse> {
    return UserPresenter.toResponse(await this.getMeUseCase.execute(user));
  }

  @Put('me')
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @ApiOperation({ summary: 'Update your account' })
  async update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateUserDto): Promise<UserResponse> {
    return UserPresenter.toResponse(await this.updateMeUseCase.execute(user, dto));
  }

  @Delete('me')
  @ApiBearerAuth(SWAGGER_BEARER_NAME)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete your account' })
  async remove(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.deleteMeUseCase.execute(user);
  }
}
