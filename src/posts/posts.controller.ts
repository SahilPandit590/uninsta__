import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, Query, BadRequestException, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import multerS3 = require('multer-s3');
import s3Client from '../config/s3';
import * as path from 'path';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts(@Query('subjectCategory') subjectCategory: string) {
    return this.postsService.getPosts(subjectCategory);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsService.getPost(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('pdf', {
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.R2_BUCKET_NAME || 'test-bucket',
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'posts/' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only PDF files are allowed!'), false);
      }
    },
  }))
  async createPost(
    @Body() body: any,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    return this.postsService.createPost(body, file, req.user);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  async addComment(
    @Param('id') id: string,
    @Body('text') text: string,
    @Req() req: any
  ) {
    return this.postsService.addComment(id, text, req.user);
  }
}
