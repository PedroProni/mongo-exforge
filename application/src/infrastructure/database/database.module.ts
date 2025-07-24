import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConnectionModule } from '@infrastructure/database/connection/mongo-connect.module';
import { EnvConfigModule } from '@common/env/env-config.module';
import { HelperModule } from '@common/helpers/helper.module';

const persistences: any = []

@Module({
    imports: [MongooseModule.forFeature([
        // { name: Example.name, schema: ExampleSchema }
    ]), ConnectionModule, EnvConfigModule, HelperModule],
    providers: [...persistences],
    exports: [ConnectionModule, ...persistences],
})
export class DatabaseModule {}
