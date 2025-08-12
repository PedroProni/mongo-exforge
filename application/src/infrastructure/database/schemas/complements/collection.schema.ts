import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CollectionDocument = Collection & Document;

@Schema({ timestamps: false, versionKey: false, collection: 'collection' })
export class Collection {
  @Prop({ required: true })
  db_name!: string;

  @Prop({ required: true })
  collection_name!: string;

  @Prop({ required: true })
  collection_fields!: string[];
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
