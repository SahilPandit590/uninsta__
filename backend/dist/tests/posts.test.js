"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// 1. Load the REAL environment variables from the root .env file BEFORE Nest boots
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const testing_1 = require("@nestjs/testing");
const mongoose_1 = __importDefault(require("mongoose"));
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('Post API Endpoints (e2e)', () => {
    let app;
    let token;
    beforeAll(async () => {
        // Optionally bump the timeout if your network connection to Cloudflare takes a moment
        jest.setTimeout(15000);
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
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
        await mongoose_1.default.disconnect();
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
        const fetchedPost = res.body.find((post) => post.title === 'Fetch Me');
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
