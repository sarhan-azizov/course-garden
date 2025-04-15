import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';

import { AppModule } from './app.module';
import {
  middleware,
  setupSwagger,
  checkEnvironmentVariables,
  setupHelmet,
  createLoggerConfig,
} from './configs';

(async function () {
  checkEnvironmentVariables();

  const app = await NestFactory.create(AppModule, {
    cors: process.env.NODE_ENV !== 'production',
  });

  const configService = app.get<ConfigService>(ConfigService);
  const host = configService.get<string>('DB_HOST');
  const port = Number(configService.get<string>('API_PORT'));

  // Setup Winston logger
  const logger = WinstonModule.createLogger(createLoggerConfig(configService));
  app.useLogger(logger);

  setupHelmet(app);
  middleware(app);
  setupSwagger(app);

  await app.listen(port, () => {
    logger.log(
      `🚀 Application is running on: http://${host}:${port}`,
      'Bootstrap',
    );
    logger.log(
      `📚 Swagger UI is available at: http://${host}:${port}/api`,
      'Bootstrap',
    );
  });
})();
