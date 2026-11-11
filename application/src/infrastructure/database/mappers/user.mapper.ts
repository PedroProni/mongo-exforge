import { UserEntity } from '@domain/entities/user.entity';
import { UserProps } from '@domain/types/user-props.type';

export class UserDocumentMapper {
  static toPersistence(entity: UserEntity): UserProps {
    return {
      _id: entity.getId(),
      name: entity.getName(),
      surname: entity.getSurname(),
      email: entity.getEmail(),
      password: entity.getPassword(),
      created_at: entity.getCreatedAt(),
      updated_at: entity.getUpdatedAt(),
    };
  }

  static toDomain(raw: UserProps): UserEntity {
    return new UserEntity({
      _id: raw._id,
      name: raw.name,
      surname: raw.surname,
      email: raw.email,
      password: raw.password,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    });
  }
}
