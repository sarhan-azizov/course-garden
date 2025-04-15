import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

import { createLoggerConfig } from '../../../configs/logger.config';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const loggerConfig = createLoggerConfig(this.configService);
    this.logger = winston.createLogger(loggerConfig);
  }

  log(message: any, context?: string, metadata?: any) {
    this.logger.info(message, { context, metadata });
  }

  error(message: any, trace?: string, context?: string, metadata?: any) {
    this.logger.error(message, { trace, context, metadata });
  }

  warn(message: any, context?: string, metadata?: any) {
    this.logger.warn(message, { context, metadata });
  }

  debug(message: any, context?: string, metadata?: any) {
    this.logger.debug(message, { context, metadata });
  }

  verbose(message: any, context?: string, metadata?: any) {
    this.logger.verbose(message, { context, metadata });
  }
} 