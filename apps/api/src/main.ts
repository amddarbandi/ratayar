import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('API_PORT', 4000);
  const nodeEnv = config.get<string>('NODE_ENV', 'development');
  const webUrl = config.get<string>('WEB_URL', 'https://zarvan.hitanetwork.com');

  // ============================================
  // 🔒 Security Headers (Helmet)
  // ============================================
  app.use(helmet({
    contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(compression());
  app.use(cookieParser(config.get<string>('COOKIE_SECRET', 'change-me')));

  // ============================================
  // 🌐 CORS - فقط دامنه خودمان
  // ============================================
  app.enableCors({
    origin: [webUrl, 'https://ratayar.ir', 'https://www.ratayar.ir'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 3600,
  });

  // ============================================
  // 📏 Body Size Limit (جلوگیری از DoS)
  // ============================================
  app.use(require('express').json({ limit: '1mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '1mb' }));

  // ============================================
  // 🌍 Global Prefix + Versioning
  // ============================================
  app.setGlobalPrefix('api');

  // ============================================
  // ✅ Validation (whitelist + forbid unknown)
  // ============================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: nodeEnv === 'production',
    }),
  );

  // ============================================
  // 📚 Swagger (فقط dev)
  // ============================================
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Ratayar API')
      .setDescription('API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  // ============================================
  // 🚫 Error Handler (پنهان کردن stack trace)
  // ============================================
  app.use((err: any, req: any, res: any, next: any) => {
    if (nodeEnv === 'production') {
      logger.error(`[${req.method} ${req.url}]`, err.message);
      res.status(err.status || 500).json({
        statusCode: err.status || 500,
        message: err.message || 'خطای سرور',
      });
    } else {
      next(err);
    }
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Ratayar API running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
