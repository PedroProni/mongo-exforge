/*
Example Schema

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExampleDocument = Example & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'example' })
export class Example {
    @Prop({ required: true })
    _id!: string;

    @Prop({ required: true })
    name!: string;

    @Prop({ required: true })
    description!: string;
}

export const ExampleSchema = SchemaFactory.createForClass(Example);
*/