import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
  OWNER = 'owner',
  SUPERADMIN = 'superadmin',
}

@Schema({ timestamps: true })
export class User {
  @Prop()
  name?: string;

  @Prop()
  avatar?: string;

  @Prop({ unique: true, required: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop()
  birth_date?: string;

  @Prop()
  gender?: number;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: 0 })
  credit?: number;

  @Prop({ default: 0 })
  blocked_credit?: number;

  @Prop({ type: Number, enum: [0, 1], default: 1 })
  status: number;

  @Prop({ default: true })
  isVerified: boolean;

  @Prop({ type: String, default: null })
  refreshTokenHash: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
