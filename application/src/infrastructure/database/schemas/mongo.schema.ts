import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Collection } from '@infrastructure/database/schemas/complements/collection.schema';

export type MongoDocument = Mongo & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'mongo' })
export class Mongo {
  @Prop({ required: true })
  user_id!: string;

  @Prop({ required: true })
  uri!: string;

  @Prop({ required: true })
  collections!: Collection[];
}

export const MongoSchema = SchemaFactory.createForClass(Mongo);
