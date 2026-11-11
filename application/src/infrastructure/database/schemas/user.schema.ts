import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'user' })
export class User {
  @Prop({ required: true, type: String })
  _id!: string;

  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String })
  surname!: string;

  @Prop({ required: true, type: String, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, type: String })
  password!: string;

  created_at!: Date;

  updated_at!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
