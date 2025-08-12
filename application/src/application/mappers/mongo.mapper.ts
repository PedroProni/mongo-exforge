import { SelectURIsCommand } from '@application/commands/export-all.commands';
import { MongoEntity } from '@domain/entities/mongo.entity';
import { SelectedURIsDto } from '@shared/dtos/export-all.dto';
import { ApplicationCollectionMapper } from '@application/mappers/complements/collection.mapper';

export class ApplicationMongoMapper {
  static toSelectURIsCommand(dto: SelectedURIsDto): SelectURIsCommand {
    return new SelectURIsCommand(dto.uris);
  }

  static toEntity(command: any): MongoEntity {
    return new MongoEntity({
      uris: command.uris,
      collections: command.collections.map((col: any) => ApplicationCollectionMapper.toEntity(col)),
    });
  }
}
