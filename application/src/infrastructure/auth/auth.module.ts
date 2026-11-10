import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { JwtAuthGuard } from '@infrastructure/auth/jwt-auth.guard';

@Global()
@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [EnvConfigService],
      useFactory: (env: EnvConfigService) => ({
        secret: env.getJwtSecret(),
        signOptions: { expiresIn: env.getJwtExpiresIn() as never, algorithm: 'HS256' },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
  exports: [JwtModule],
})
export class AuthModule {}
