import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DomainUserMapper } from '@domain/mappers/user.mapper';
import { UserEntity } from '@domain/entities/user.entity';
import { User, UserDocument } from '@infrastructure/database/schemas/user.schema';

@Injectable()
export class UserPersistence {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const already_exists = await this.userModel.findOne({ email: user.getEmail() }).exec();

    if (already_exists) throw new NotFoundException('User with this email already exists');

    const new_user = DomainUserMapper.toPersistence(user);
    await this.userModel.create(new_user);
    return DomainUserMapper.toDomain(new_user);
  }

  async find(page: number, limit: number, id?: string, email?: string): Promise<UserEntity[]> {
    const query: any = {};
    if (id) query._id = id;
    if (email) query.email = email;

    const users = await this.userModel.find(query).skip((page - 1) * limit).limit(limit).exec();
    return users.map(DomainUserMapper.toDomain);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const updated_user = await this.userModel.findByIdAndUpdate(user.getId(), DomainUserMapper.toPersistence(user), { new: true }).exec();
    return DomainUserMapper.toDomain(updated_user);
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
