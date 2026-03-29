import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, index: true })
  subjectCategory: string;

  @Prop({ required: true })
  pdfUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: User | Types.ObjectId;

  @Prop({ default: 0 })
  views: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
