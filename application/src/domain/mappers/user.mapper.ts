import { UserEntity } from '@domain/entities/user.entity';

export class DomainUserMapper {
  static toPersistence(entity: UserEntity): any {
    return {
      _id: entity.getId(),
      tier: entity.getTier(),
      name: entity.getName(),
      surname: entity.getSurname(),
      email: entity.getEmail(),
      password: entity.getPassword(),
      created_at: entity.getCreatedAt(),
      updated_at: entity.getUpdatedAt(),
    };
  }

  static toDomain(raw: any): UserEntity {
    return new UserEntity({
      _id: raw._id,
      tier: raw.tier,
      name: raw.name,
      surname: raw.surname,
      email: raw.email,
      password: raw.password,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    });
  }
}
