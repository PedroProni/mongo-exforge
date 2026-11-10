import { Inject, Injectable } from '@nestjs/common';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { StoragePort } from '@domain/ports/storage.port';
import { JobRepository } from '@domain/repositories/job.repository';
import { UserRepository } from '@domain/repositories/user.repository';
import { CONNECTION_INJECT_TOKEN, JOB_INJECT_TOKEN, STORAGE_INJECT_TOKEN, USER_INJECT_TOKEN } from '@domain/constants/inject.constant';
import { AuthenticatedUser } from '@domain/types/authenticated-user.type';

@Injectable()
export class DeleteMeUseCase {
  constructor(
    @Inject(USER_INJECT_TOKEN) private readonly userRepository: UserRepository,
    @Inject(JOB_INJECT_TOKEN) private readonly jobRepository: JobRepository,
    @Inject(CONNECTION_INJECT_TOKEN) private readonly connectionRepository: ConnectionRepository,
    @Inject(STORAGE_INJECT_TOKEN) private readonly storage: StoragePort,
  ) {}

  async execute(user: AuthenticatedUser): Promise<void> {
    const keys = await this.jobRepository.deleteAllOwned(user.id);
    await Promise.allSettled(keys.map(key => this.storage.delete(key)));
    await this.connectionRepository.deleteAllOwned(user.id);
    await this.userRepository.delete(user.id);
  }
}
