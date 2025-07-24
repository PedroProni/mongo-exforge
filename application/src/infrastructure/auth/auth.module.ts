import { Module } from '@nestjs/common';
import { AuthGuard } from '@infrastructure/auth/auth.guard';
import { EnvConfigModule } from '@common/env/env-config.module';

@Module({
  imports: [EnvConfigModule],  
  providers: [AuthGuard],
  exports: [AuthGuard, EnvConfigModule],
})
export class AuthModule {}