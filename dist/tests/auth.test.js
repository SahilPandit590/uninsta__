"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('Auth API Endpoints (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    const userData = {
        username: 'testusernest',
        email: 'testnest@example.com',
        password: 'password123',
    };
    it('/auth/register (POST)', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/register')
            .send(userData);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('token');
    });
    it('/auth/login (POST)', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: userData.email, password: userData.password });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});
