import { UserEntity } from '@domain/entities/user.entity';
import { UserResponse } from '@shared/responses/user-response.type';

export class UserPresenter {
  static toResponse(user: UserEntity): UserResponse {
    return { id: user.getId(), name: user.getName(), surname: user.getSurname(), email: user.getEmail(), created_at: user.getCreatedAt() };
  }
}
