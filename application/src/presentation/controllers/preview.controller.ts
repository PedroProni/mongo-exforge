import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PreviewSourceUseCase } from '@application/use-cases/mongo/preview-source.use-case';
import { CurrentUser } from '@infrastructure/auth/decorators/current-user.decorator';
import { SWAGGER_BEARER_NAME } from '@infrastructure/documentation/config/swagger-constants.config';
import { JobInputMapper } from '@presentation/mappers/job-input.mapper';
import { PreviewPresenter } from '@presentation/presenters/preview.presenter';
import { PREVIEW_RATE_LIMIT_PER_MINUTE, PREVIEW_RATE_LIMIT_WINDOW_MS } from '@domain/constants/preview.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';
import { PreviewDto } from '@shared/dtos/job/preview.dto';
import { PreviewResponse } from '@shared/responses/preview-response.type';

@ApiTags('Preview')
@ApiBearerAuth(SWAGGER_BEARER_NAME)
@Controller('preview')
export class PreviewController {
  constructor(private readonly previewSourceUseCase: PreviewSourceUseCase) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: PREVIEW_RATE_LIMIT_PER_MINUTE, ttl: PREVIEW_RATE_LIMIT_WINDOW_MS } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview the first rows and the row count estimate of an export' })
  async preview(@CurrentUser() user: AuthenticatedUser, @Body() dto: PreviewDto): Promise<PreviewResponse> {
    return PreviewPresenter.toResponse(await this.previewSourceUseCase.execute(user, JobInputMapper.toPreviewInput(dto)));
  }
}
