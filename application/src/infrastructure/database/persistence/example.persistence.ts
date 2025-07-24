/*
Example Persistence
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class ExamplePersistence implements ExampleRepository {
  private readonly logger = new Logger(ExamplePersistence.name);

  constructor(
    @InjectModel(Example.name) private readonly exampleModel: Model<ExampleDocument>,,
  ) {}

  // Main methods

  async create(example: ExampleEntity): Promise<ExampleEntity> {
    const new_rules_assignment = ExampleMapper.toPersistence(example);
    await this.basicCreateValidation(new_rules_assignment);
    await this.exampleModel.create(new_rules_assignment);
    return ExampleMapper.toDomain(new_rules_assignment);
  }

  async findAll(page: number, limit: number, id?: string): Promise<ExampleEntity[]> {
    const query: any = {};
    if (id) {
      query._id = id;
    }
    const examples = await this.exampleModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    return examples.map(ExampleMapper.toDomain);
  }

  // Auxiliary methods

  async basicCreateValidation(example: Example): Promise<void> {
    const existing = await this.exampleModel.findOne({
      entity_type: example.entity_type,
      entity_id: example.entity_id,
    });
    if (existing) {
      throw new BadRequestException(`Rule assignment for entity type ${example.entity_type} and entity ID ${example.entity_id} already exists.`);
    };
  }
}
*/