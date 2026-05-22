import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import morgan = require('morgan');

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  logger.debug(`Starting API bootstrap (NODE_ENV=${process.env.NODE_ENV ?? 'undefined'})`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
  });
  logger.debug(`CORS enabled for ${process.env.CORS_ORIGIN ?? 'http://localhost:4200'}`);

  app.use(
    morgan('dev', {
      stream: {
        write: (message: string) => Logger.debug(message.replace('\n', ''), 'HTTP'),
      },
    }),
  );
  logger.debug('Morgan request logger configured');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FinTech Aid Requests API')
    .setDescription('API for managing aid requests')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);
  logger.debug('Swagger documentation available at /api-docs');

  await app.listen(port);
  logger.log(`API is listening on http://localhost:${port}`);
}

void bootstrap();
