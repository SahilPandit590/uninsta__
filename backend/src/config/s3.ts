import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://mock.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'mock',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'mock',
  },
});

export default s3Client;
