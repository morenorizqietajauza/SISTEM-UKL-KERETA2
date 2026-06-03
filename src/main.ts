import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefix semua route => /api
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({});

  // Validation DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger config
  const config = new DocumentBuilder()
  .setTitle('Tiket Kereta')
  .setDescription('BackEnd System for Train Ticket Application')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token',
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger URL => /api/docs
  SwaggerModule.setup('api/docs', app, document);

  // Run server
  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `Server running on http://localhost:${process.env.PORT ?? 3000}/api`,
  );

  console.log(
    `Swagger docs on http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}

bootstrap();