import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';
import { DataSource } from 'typeorm';

// Crypto polyfill for Node.js compatibility
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

async function bootstrap() {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Port:', process.env.PORT);

  // Create different logging configurations for different environments
  const createLoggerConfig = () => {
    const transports: winston.transport[] = [
      // Always include console transport
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike('Leanspot', {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
    ];

    // Only add file transports in local development
    if (process.env.NODE_ENV === 'local') {
      const logDir = path.join(__dirname, '../../logs');
      console.log('Log directory (local only):', logDir);

      transports.push(
        new winston.transports.File({
          dirname: logDir,
          filename: 'warning.log',
          level: 'warn',
        }),
        new winston.transports.File({
          dirname: logDir,
          filename: 'debug.log',
          level: 'debug',
        }),
        new winston.transports.File({
          dirname: logDir,
          filename: 'error.log',
          level: 'error',
        }),
        new winston.transports.File({
          dirname: logDir,
          filename: 'info.log',
          level: 'info',
        }),
      );
    } else {
      console.log('Production mode: Using console logging only');
    }

    return {
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports,
    };
  };

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    logger: WinstonModule.createLogger(createLoggerConfig()),
  });

  app.useGlobalPipes(new I18nValidationPipe());
  app.useGlobalFilters(new I18nValidationExceptionFilter());

  // Enable CORS for production
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5183',
      'https://web-production-6fc45.up.railway.app',
      "https://app.propertylinqs.com",
      ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Access-Control-Allow-Headers',
      'Origin',
      'Cache-Control',
      'Pragma'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  const config = new DocumentBuilder()
    .setTitle('Leanspot')
    .setDescription('The swagger documentation for Leanspot')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Only enable Swagger in local development
  if (process.env.NODE_ENV === 'local') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // Check database connection and log status
  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      console.log('🎉 Application started with database connection!');
      console.log(`📊 Connected to PostgreSQL database: ${dataSource.options.database}`);
      console.log(`🔗 Connection established at: ${new Date().toISOString()}`);

      // Optional: Test a simple query
      try {
        const result = await dataSource.query('SELECT NOW()');
        console.log(`⏰ Database time: ${result[0].now}`);
      } catch (error) {
        console.warn('⚠️  Could not fetch database time:', error.message);
      }
    } else {
      console.error('💥 Application started but database connection failed!');
    }
  } catch (error) {
    console.error('❌ Error checking database connection:', error.message);
  }

  const port =  3000;
  await app.listen(port, '0.0.0.0'); // Important: bind to 0.0.0.0 for Railway
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
}

bootstrap();
