import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { Comment, CommentDocument } from '../schemas/comment.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>
  ) {}

  async getPosts(subjectCategory?: string) {
    const query: any = {};
    if (subjectCategory) {
      query.subjectCategory = subjectCategory;
    }
    return this.postModel.find(query).sort({ createdAt: -1 }).populate('author', 'username email');
  }

  async getPost(id: string) {
    const post = await this.postModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username email');

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = await this.commentModel.find({ post: id })
      .sort({ createdAt: -1 })
      .populate('author', 'username');

    return { post, comments };
  }

  async createPost(body: any, file: any, user: any) {
    const { title, description, subjectCategory } = body;
    
    if (!title || !description || !subjectCategory) {
      throw new BadRequestException('Please add all required fields');
    }
    if (!file) {
      throw new BadRequestException('Please upload a PDF file');
    }

    const post = await this.postModel.create({
      title,
      description,
      subjectCategory,
      pdfUrl: file.location,
      author: user._id,
    });

    return post;
  }

  async addComment(postId: string, text: string, user: any) {
    if (!text) {
      throw new BadRequestException('Comment text is required');
    }

    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.commentModel.create({
      text,
      author: user._id,
      post: postId,
    });

    await comment.populate('author', 'username');
    return comment;
  }
}
