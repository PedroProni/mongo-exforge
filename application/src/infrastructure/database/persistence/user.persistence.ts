import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@infrastructure/database/schemas/user.schema';
import { UserDocumentMapper } from '@infrastructure/database/mappers/user.mapper';
import { UserEntity } from '@domain/entities/user.entity';
import { UserRepository } from '@domain/repositories/user.repository';
import { UserChanges } from '@domain/types/user-changes.type';
import { UserProps } from '@domain/types/user-props.type';

const DUPLICATE_KEY_CODE = 11000;
const EMAIL_TAKEN_MESSAGE = 'Email already registered';

@Injectable()
export class UserPersistence implements UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      await this.userModel.create(UserDocumentMapper.toPersistence(user));
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_CODE) throw new ConflictException(EMAIL_TAKEN_MESSAGE);
      throw error;
    }
    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const raw = await this.userModel.findById(id).lean<UserProps>().exec();
    return raw ? UserDocumentMapper.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const raw = await this.userModel.findOne({ email: email.trim().toLowerCase() }).lean<UserProps>().exec();
    return raw ? UserDocumentMapper.toDomain(raw) : null;
  }

  async update(id: string, changes: UserChanges): Promise<UserEntity | null> {
    const patch = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
    if (typeof patch.email === 'string') patch.email = patch.email.trim().toLowerCase();
    try {
      const raw = await this.userModel.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean<UserProps>().exec();
      return raw ? UserDocumentMapper.toDomain(raw) : null;
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_CODE) throw new ConflictException(EMAIL_TAKEN_MESSAGE);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id }).exec();
  }
}
