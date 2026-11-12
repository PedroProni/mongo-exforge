import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template, TemplateDocument } from '@infrastructure/database/schemas/template.schema';
import { TemplateDocumentMapper } from '@infrastructure/database/mappers/template.mapper';
import { TemplateEntity } from '@domain/entities/template.entity';
import { TemplateRepository } from '@domain/repositories/template.repository';
import { DUPLICATE_KEY_CODE } from '@domain/constants/auth.constant';
import { TEMPLATE_NAME_TAKEN_MESSAGE } from '@domain/constants/template.constant';
import { TemplateProps } from '@domain/types/template-props.type';

@Injectable()
export class TemplatePersistence implements TemplateRepository {
  constructor(@InjectModel(Template.name) private readonly templateModel: Model<TemplateDocument>) {}

  async create(template: TemplateEntity): Promise<TemplateEntity> {
    try {
      await this.templateModel.create(TemplateDocumentMapper.toPersistence(template));
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_CODE) throw new ConflictException(TEMPLATE_NAME_TAKEN_MESSAGE);
      throw error;
    }
    return template;
  }

  async findOwned(user_id: string, id: string): Promise<TemplateEntity | null> {
    const raw = await this.templateModel.findOne({ _id: id, user_id }).lean<TemplateProps>().exec();
    return raw ? TemplateDocumentMapper.toDomain(raw) : null;
  }

  async listOwned(user_id: string): Promise<TemplateEntity[]> {
    const raws = await this.templateModel.find({ user_id }).sort({ created_at: -1 }).lean<TemplateProps[]>().exec();
    return raws.map(raw => TemplateDocumentMapper.toDomain(raw));
  }

  countOwned(user_id: string): Promise<number> {
    return this.templateModel.countDocuments({ user_id }).exec();
  }

  async renameOwned(user_id: string, id: string, name: string): Promise<boolean> {
    try {
      const result = await this.templateModel.updateOne({ _id: id, user_id }, { $set: { name } }).exec();
      return result.matchedCount > 0;
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_CODE) throw new ConflictException(TEMPLATE_NAME_TAKEN_MESSAGE);
      throw error;
    }
  }

  async deleteOwned(user_id: string, id: string): Promise<boolean> {
    const result = await this.templateModel.deleteOne({ _id: id, user_id }).exec();
    return result.deletedCount > 0;
  }

  async deleteAllOwned(user_id: string): Promise<void> {
    await this.templateModel.deleteMany({ user_id }).exec();
  }
}
