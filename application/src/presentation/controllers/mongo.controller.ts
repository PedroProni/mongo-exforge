import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationMongoMapper } from '@application/mappers/mongo.mapper';
import { SelectedURIsDto } from '@shared/dtos/export-all.dto';
import { SelectURIsUseCase } from '@application/use-cases/mongo/select-uris.use-case';

@ApiTags('Mongo')
@Controller('mongo')
export class MongoController {
  constructor(private readonly selectURIsUseCase: SelectURIsUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() selectedURIsDto: SelectedURIsDto) {
    const command = ApplicationMongoMapper.toSelectURIsCommand(selectedURIsDto);
    return await this.selectURIsUseCase.execute(command.uris);
  }
}
