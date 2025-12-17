import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { Request, Response } from 'express';

import { AppModule } from './app.module';

// Create Express server
const server = express();

// Create Nest application
async function createNestApp() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174',
      // Add Vercel domains
      /\.vercel\.app$/,
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Family Tree Graph API')
    .setDescription(
      'API for managing family relationships and social connections',
    )
    .setVersion('1.0')
    .addTag('family-tree')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.init();
  return app;
}

// For local development
async function bootstrap() {
  const app = await createNestApp();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Application is running on: http://localhost:${port}`);
}

// Export for Vercel serverless
let cachedApp: Awaited<ReturnType<typeof createNestApp>> | null = null;

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  if (!cachedApp) {
    cachedApp = await createNestApp();
  }
  return server(req, res);
}

// Run bootstrap only if not in serverless environment
if (require.main === module) {
  bootstrap();
}
