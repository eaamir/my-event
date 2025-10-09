import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type CollectionDocument = Collection & Document;

export enum CollectionStatus {
  ACTIVE = 1,
  INACTIVE = 0,
}

@Schema({ timestamps: true })
export class Collection {
  @Prop({ required: true })
  name: string;

  @Prop()
  logo?: string;

  @Prop()
  cover?: string;

  @Prop()
  description?: string;

  @Prop({
    type: Number,
    enum: CollectionStatus,
    default: CollectionStatus.ACTIVE,
  })
  status: number;

  // 👇 Reference to the user who created this collection
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User | Types.ObjectId;

  // 👇 NEW FIELD: list of events the collection is connected to
  //   @Prop({ type: [{ type: Types.ObjectId, ref: 'Event' }] })
  //   events: (Event | Types.ObjectId)[];
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
