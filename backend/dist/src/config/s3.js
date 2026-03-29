"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Client = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || 'https://mock.r2.cloudflarestorage.com',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || 'mock',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'mock',
    },
});
exports.default = s3Client;
