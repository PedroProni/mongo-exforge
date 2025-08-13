import { UserTier } from '@domain/enums/all.enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'user' })
export class User {
  @Prop()
  _id!: string;

  @Prop({ required: true, enum: UserTier, type: String })
  tier!: UserTier;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  surname!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: Date, default: Date.now })
  created_at!: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
