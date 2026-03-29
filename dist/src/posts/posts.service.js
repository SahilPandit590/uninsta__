"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_schema_1 = require("../schemas/post.schema");
const comment_schema_1 = require("../schemas/comment.schema");
let PostsService = class PostsService {
    postModel;
    commentModel;
    constructor(postModel, commentModel) {
        this.postModel = postModel;
        this.commentModel = commentModel;
    }
    async getPosts(subjectCategory) {
        const query = {};
        if (subjectCategory) {
            query.subjectCategory = subjectCategory;
        }
        return this.postModel.find(query).sort({ createdAt: -1 }).populate('author', 'username email');
    }
    async getPost(id) {
        const post = await this.postModel.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).populate('author', 'username email');
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const comments = await this.commentModel.find({ post: id })
            .sort({ createdAt: -1 })
            .populate('author', 'username');
        return { post, comments };
    }
    async createPost(body, file, user) {
        const { title, description, subjectCategory } = body;
        if (!title || !description || !subjectCategory) {
            throw new common_1.BadRequestException('Please add all required fields');
        }
        if (!file) {
            throw new common_1.BadRequestException('Please upload a PDF file');
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
    async addComment(postId, text, user) {
        if (!text) {
            throw new common_1.BadRequestException('Comment text is required');
        }
        const post = await this.postModel.findById(postId);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const comment = await this.commentModel.create({
            text,
            author: user._id,
            post: postId,
        });
        await comment.populate('author', 'username');
        return comment;
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __param(1, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PostsService);
