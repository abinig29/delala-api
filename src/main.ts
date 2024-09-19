import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigurationService } from './core/configuration';
import * as cookieParser from 'cookie-parser';
import { CorsService } from './core/cors';
import { LoggerService } from './libraries/logger';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configurationService = app.get(ConfigurationService)
  const corsService = app.get(CorsService)
  const loggerService = app.get(LoggerService)

  const logger = loggerService.create({ name: 'App' })


  app.enableCors(corsService.getOptions())
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(cookieParser())

  const port = configurationService.getPort()
  app.use(helmet({
    frameguard: ({ action: 'deny' }),
    hsts: ({
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    }),
  }));
  app.setGlobalPrefix('api')


  const config = new DocumentBuilder()
    .setTitle('Delala API')
    .setDescription('this is the documentation for the Delala API')
    .setVersion('1.0')
    .addTag('version one')
    .addBearerAuth()
    .build()


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);


  await app.listen(port)
  logger.success(`Application started on port ${port}`)

}
bootstrap();
