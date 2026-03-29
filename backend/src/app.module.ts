import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Try standard CWD first, fallback to workspace root context traversing paths
const cwdEnv = path.resolve(process.cwd(), '.env');
const rootEnv = path.resolve(process.cwd(), 'backend', '.env');
const validPath = fs.existsSync(cwdEnv) ? cwdEnv : rootEnv;
dotenv.config({ path: validPath });

import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = process.env.MONGODB_URI;
        if (uri) {
          console.log('[Database] Connecting to MongoDB Atlas Cluster✅');
        } else {
          console.warn('[Database] WARNING: MONGODB_URI not found in .env! Falling back to localhost/uninsta ❌');
        }
        return {
          uri: uri || 'mongodb://localhost/uninsta',
        };
      },
    }),
    AuthModule,
    PostsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
