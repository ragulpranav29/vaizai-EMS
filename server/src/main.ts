import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend cross-origin requests
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`NestJS Server listening on port ${port}`);
}
bootstrap();
