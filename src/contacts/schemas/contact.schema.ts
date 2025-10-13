import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsIn } from 'class-validator';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type ContactDocument = Contact & Document;

@Schema({ timestamps: true })
export class Contact extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone?: string;

  @Prop()
  @IsIn([1, 2])
  gender?: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User | Types.ObjectId;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
