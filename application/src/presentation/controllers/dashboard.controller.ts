import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetDashboardUseCase } from '@application/use-cases/dashboard/get-dashboard.use-case';
import { CurrentUser } from '@infrastructure/auth/decorators/current-user.decorator';
import { SWAGGER_BEARER_NAME } from '@infrastructure/documentation/config/swagger-constants.config';
import { DashboardPresenter } from '@presentation/presenters/dashboard.presenter';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { DashboardResponse } from '@shared/responses/dashboard-response.type';

@ApiTags('Dashboard')
@ApiBearerAuth(SWAGGER_BEARER_NAME)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Totals, formats, recent activity and exports over time for the authenticated user' })
  async summary(@CurrentUser() user: AuthenticatedUser): Promise<DashboardResponse> {
    return DashboardPresenter.toResponse(await this.getDashboardUseCase.execute(user));
  }
}
