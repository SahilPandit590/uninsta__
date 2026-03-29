import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Enable CORS for React frontend defaults
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', '*'],
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '127.0.0.1');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
