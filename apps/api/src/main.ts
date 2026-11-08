import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Next.js web application
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Serve static uploads with OWASP security headers
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  app.use(
    '/uploads',
    (req: any, res: any, next: any) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'");
      res.setHeader('Cache-Control', 'public, max-age=86400');
      next();
    },
    express.static(uploadDir),
  );

  const port = process.env.PORT || 5000;
  await app.listen(port);
  logger.log(`🚀 KhojSetu NestJS API running on: http://localhost:${port}`);
  logger.log(`📡 OpenTelemetry & Health Check available at: http://localhost:${port}/health`);
}

bootstrap();
