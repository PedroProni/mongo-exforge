import { Module } from '@nestjs/common';
import { ApplicationModule } from '@application/application.module';
import { EnvConfigModule } from '@common/env/env-config.module';
import { HelperModule } from '@common/helpers/helper.module';
import { DomainModule } from '@domain/domain.module';
import { PresentationModule } from '@presentation/presentation.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

const modules = [ApplicationModule, EnvConfigModule, DomainModule, PresentationModule, HelperModule, InfrastructureModule];

@Module({
  imports: [...modules],
})
export class AppModule {}
