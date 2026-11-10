import { NotFoundException } from '@nestjs/common';
import { EncryptionService } from '@application/services/encryption.service';
import { InspectConnectionUseCase } from '@application/use-cases/connection/inspect-connection.use-case';
import { ListConnectionsUseCase } from '@application/use-cases/connection/list-connections.use-case';
import { InspectSourcesUseCase } from '@application/use-cases/mongo/inspect-sources.use-case';
import { ConnectionRepository } from '@domain/repositories/connection.repository';

describe('InspectConnectionUseCase and ListConnectionsUseCase', () => {
  const user = { id: 'user-1', email: 'a@b.dev' };

  it('inspects the decrypted uri of an owned connection', async () => {
    const repository = { findOwned: jest.fn().mockResolvedValue({ getUri: () => 'v2:cipher' }) };
    const encryption = { decrypt: jest.fn().mockReturnValue('mongodb://db/app') };
    const inspect = { execute: jest.fn().mockResolvedValue(['collection']) };
    const useCase = new InspectConnectionUseCase(repository as unknown as ConnectionRepository, encryption as unknown as EncryptionService, inspect as unknown as InspectSourcesUseCase);
    await expect(useCase.execute(user, 'c1')).resolves.toEqual(['collection']);
    expect(repository.findOwned).toHaveBeenCalledWith('user-1', 'c1');
    expect(inspect.execute).toHaveBeenCalledWith(['mongodb://db/app']);
  });

  it('hides a connection that is not owned and never inspects', async () => {
    const repository = { findOwned: jest.fn().mockResolvedValue(null) };
    const inspect = { execute: jest.fn() };
    const useCase = new InspectConnectionUseCase(repository as unknown as ConnectionRepository, {} as EncryptionService, inspect as unknown as InspectSourcesUseCase);
    await expect(useCase.execute(user, 'c9')).rejects.toBeInstanceOf(NotFoundException);
    expect(inspect.execute).not.toHaveBeenCalled();
  });

  it('lists only the connections of the caller', async () => {
    const repository = { listOwned: jest.fn().mockResolvedValue(['one']) };
    const useCase = new ListConnectionsUseCase(repository as unknown as ConnectionRepository);
    await expect(useCase.execute(user)).resolves.toEqual(['one']);
    expect(repository.listOwned).toHaveBeenCalledWith('user-1');
  });
});
