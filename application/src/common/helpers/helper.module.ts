import { Module } from '@nestjs/common';
import { EnvConfigModule } from '@common/env/env-config.module';
import { CsvHelper } from '@common/helpers/functions/csv.helper';
import { JsonHelper } from '@common/helpers/functions/json.helper';
import { XlsxHelper } from '@common/helpers/functions/xlsx.helper';

@Module({
  imports: [EnvConfigModule],
  providers: [CsvHelper, JsonHelper, XlsxHelper],
  exports: [CsvHelper, JsonHelper, XlsxHelper],
})
export class HelperModule {}
