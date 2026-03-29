import * as dotenv from 'dotenv';
import * as path from 'path';

// 1. Load the REAL environment variables from the root .env file BEFORE Nest boots
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Post API Endpoints (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    // Optionally bump the timeout if your network connection to Cloudflare takes a moment
    jest.setTimeout(15000);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register a test user to get a valid JWT
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'postusernest',
        email: 'postusernest@example.com',
        password: 'password123',
      });
    token = res.body.token;
  });

  afterAll(async () => {
    // Properly close the app AND the database connection to free up the Jest worker
    if (app) {
      await app.close();
    }
    await mongoose.disconnect();
  });

  it('should create a new post', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Test PDF')
      .field('description', 'A test physics resource')
      .field('subjectCategory', 'Physics')
      .attach('pdf', Buffer.from('mock pdf content'), 'test.pdf');

    expect(res.status).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toEqual('Test PDF');

    // Check that a real URL pointing to your Cloudflare storage was returned
    expect(res.body.pdfUrl).toContain('.r2.cloudflarestorage.com');
  });

  it('should fetch all posts', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Fetch Me')
      .field('description', 'To be fetched')
      .field('subjectCategory', 'Math')
      .attach('pdf', Buffer.from('mock pdf content'), 'test.pdf');

    const res = await request(app.getHttpServer()).get('/posts');

    expect(res.status).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);

    // Robust check: Find the post by title instead of guessing the index
    const fetchedPost = res.body.find((post: any) => post.title === 'Fetch Me');
    expect(fetchedPost).toBeDefined();
    expect(fetchedPost.title).toEqual('Fetch Me');
  });

  it('should increment view count and fetch a single post', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'View Count Test')
      .field('description', 'Test desc')
      .field('subjectCategory', 'Chemistry')
      .attach('pdf', Buffer.from('mock pdf'), 'test.pdf');

    const postId = postRes.body._id;

    const firstFetch = await request(app.getHttpServer()).get(`/posts/${postId}`);
    expect(firstFetch.status).toEqual(200);
    expect(firstFetch.body.post.views).toEqual(1);

    const secondFetch = await request(app.getHttpServer()).get(`/posts/${postId}`);
    expect(secondFetch.body.post.views).toEqual(2);
  });

  it('should add a comment to a post', async () => {
    const postRes = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Comment Test')
      .field('description', 'Testing comments')
      .field('subjectCategory', 'Computer Science')
      .attach('pdf', Buffer.from('mock'), 'test.pdf');

    const postId = postRes.body._id;

    const commentRes = await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'This is a great resource!' });

    expect(commentRes.status).toEqual(201);
    expect(commentRes.body.text).toEqual('This is a great resource!');
  });
});