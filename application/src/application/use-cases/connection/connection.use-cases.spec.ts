import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EncryptionService } from '@application/services/encryption.service';
import { CreateConnectionUseCase } from '@application/use-cases/connection/create-connection.use-case';
import { DeleteConnectionUseCase } from '@application/use-cases/connection/delete-connection.use-case';
import { MAX_CONNECTIONS_PER_USER } from '@domain/constants/connection.constant';
import { ConnectionEntity } from '@domain/entities/connection.entity';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { MongoRepository } from '@domain/repositories/mongo.repository';

describe('connection use cases', () => {
  const user = { id: 'user-1', email: 'a@b.dev' };
  const uri = 'mongodb://demo:s3cr3t@db.example.com:27017/app';

  function build(count = 0, allowed = true) {
    const repository = {
      countOwned: jest.fn().mockResolvedValue(count),
      create: jest.fn(async (connection: ConnectionEntity) => connection),
      deleteOwned: jest.fn(),
    };
    const mongo = { assertAllowed: allowed ? jest.fn() : jest.fn().mockRejectedValue(new Error('The MongoDB host is not allowed')) };
    const encryption = { encrypt: jest.fn((value: string) => `v2:${value}`) };
    const create = new CreateConnectionUseCase(repository as unknown as ConnectionRepository, mongo as unknown as MongoRepository, encryption as unknown as EncryptionService);
    const remove = new DeleteConnectionUseCase(repository as unknown as ConnectionRepository);
    return { repository, create, remove };
  }

  it('stores the encrypted uri and a masked copy', async () => {
    const { create, repository } = build();
    const saved = await create.execute(user, { name: '  Sample  ', uri });
    const created = repository.create.mock.calls[0][0];
    expect(saved).toBe(created);
    expect(created.getName()).toBe('Sample');
    expect(created.getUri()).toBe(`v2:${uri}`);
    expect(created.getUriMasked()).toContain('demo:***@');
    expect(created.getUriMasked()).not.toContain('s3cr3t');
  });

  it('refuses a uri the guard rejects', async () => {
    const { create, repository } = build(0, false);
    await expect(create.execute(user, { name: 'x', uri })).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('refuses more connections than the limit', async () => {
    const { create, repository } = build(MAX_CONNECTIONS_PER_USER);
    await expect(create.execute(user, { name: 'x', uri })).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('deletes an owned connection and hides one that is not', async () => {
    const { remove, repository } = build();
    repository.deleteOwned.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await expect(remove.execute(user, 'c1')).resolves.toBeUndefined();
    await expect(remove.execute(user, 'c2')).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.deleteOwned).toHaveBeenCalledWith('user-1', 'c2');
  });
});
