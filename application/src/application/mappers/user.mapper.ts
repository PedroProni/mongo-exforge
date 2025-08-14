import { CreateUserCommand, LoginUserCommand, UpdateUserCommand } from '@application/commands/export-all.commands';
import { UserEntity } from '@domain/entities/user.entity';

export class ApplicationUserMapper {
  static toCreateUserCommand(data: any): CreateUserCommand {
    return new CreateUserCommand('', data.tier, data.name, data.surname, data.email, data.password, new Date(), new Date());
  }

  static toUpdateUserCommand(data: any, id: string): UpdateUserCommand {
    return new UpdateUserCommand(id, data.tier, data.name, data.surname, data.email, data.password, data.created_at, new Date());
  }

  static toLoginUserCommand(data: any): LoginUserCommand {
    return new LoginUserCommand(data.email, data.password);
  }

  static toEntity(command: any): UserEntity {
    return new UserEntity({ _id: command._id, tier: command.tier, name: command.name, surname: command.surname, email: command.email, password: command.password, created_at: command.created_at, updated_at: command.updated_at });
  }
}
