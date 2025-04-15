import { ValidationPipe, INestApplication } from '@nestjs/common';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';

import { GlobalExceptionFilter, LoggingInterceptor } from '@/common';
import { LoggerService } from '@/modules';

export const middleware = (app: INestApplication): INestApplication => {
  app.use(compression());
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(app.get(LoggerService)));

  return app;
};
