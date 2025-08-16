import { SelectURIsCommand } from '@application/commands/export-all.commands';
import { MongoEntity } from '@domain/entities/mongo.entity';
import { SelectedURIsDto } from '@shared/dtos/export-all.dto';
import { ApplicationCollectionMapper } from '@application/mappers/complements/collection.mapper';

export class ApplicationMongoMapper {
  static toSelectURIsCommand(dto: SelectedURIsDto): SelectURIsCommand {
    return new SelectURIsCommand(dto.remember_me, dto.uris);
  }

  static toEntity(command: any): MongoEntity {
    return new MongoEntity({
      user_id: command.user_id,
      remember_me: command.remember_me,
      uri: command.uri,
      collections: command.collections.map((col: any) => ApplicationCollectionMapper.toEntity(col)),
    });
  }
}
