import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connection, ConnectionDocument } from '@infrastructure/database/schemas/connection.schema';
import { ConnectionDocumentMapper } from '@infrastructure/database/mappers/connection.mapper';
import { ConnectionEntity } from '@domain/entities/connection.entity';
import { ConnectionRepository } from '@domain/repositories/connection.repository';
import { ConnectionProps } from '@domain/types/connection-props.type';

@Injectable()
export class ConnectionPersistence implements ConnectionRepository {
  constructor(@InjectModel(Connection.name) private readonly connectionModel: Model<ConnectionDocument>) {}

  async create(connection: ConnectionEntity): Promise<ConnectionEntity> {
    await this.connectionModel.create(ConnectionDocumentMapper.toPersistence(connection));
    return connection;
  }

  async findOwned(user_id: string, id: string): Promise<ConnectionEntity | null> {
    const raw = await this.connectionModel.findOne({ _id: id, user_id }).lean<ConnectionProps>().exec();
    return raw ? ConnectionDocumentMapper.toDomain(raw) : null;
  }

  async listOwned(user_id: string): Promise<ConnectionEntity[]> {
    const raws = await this.connectionModel.find({ user_id }).sort({ created_at: -1 }).lean<ConnectionProps[]>().exec();
    return raws.map(raw => ConnectionDocumentMapper.toDomain(raw));
  }

  countOwned(user_id: string): Promise<number> {
    return this.connectionModel.countDocuments({ user_id }).exec();
  }

  async deleteOwned(user_id: string, id: string): Promise<boolean> {
    const result = await this.connectionModel.deleteOne({ _id: id, user_id }).exec();
    return result.deletedCount > 0;
  }

  async deleteAllOwned(user_id: string): Promise<void> {
    await this.connectionModel.deleteMany({ user_id }).exec();
  }
}
