import * as fs from 'fs';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';
import { WinstonModuleOptions } from 'nest-winston';

const loggerFormats = {
  file: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),

  console: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context, trace, metadata }) => {
      const metadataStr = metadata ? `\nMetadata: ${JSON.stringify(metadata, null, 2)}` : '';
      const contextStr = context ? `[${context}] ` : '';
      const traceStr = trace ? `\nStack Trace: ${trace}` : '';
      return `${timestamp} ${level}: ${contextStr}${message}${metadataStr}${traceStr}`;
    })
  )
};

const createDailyRotateTransport = (
  filename: string,
  format = loggerFormats.file
) => {
  return new DailyRotateFile({
    filename,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format
  });
};

const createConsoleTransport = () => {
  return new winston.transports.Console({
    format: loggerFormats.console
  });
};

export const createLoggerConfig = (configService: ConfigService): WinstonModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const logDir = configService.get<string>('LOG_DIR') || 'logs';

  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  return {
    levels: winston.config.npm.levels,
    level: isProduction ? 'info' : 'debug',
    transports: [
      // Rotating file for regular logs
      createDailyRotateTransport(`${logDir}/application-%DATE%.log`),
      // Console transport for development
      createConsoleTransport()
    ],
    // Separate files for exceptions and rejections
    exceptionHandlers: [
      createDailyRotateTransport(`${logDir}/exceptions-%DATE%.log`)
    ],
    rejectionHandlers: [
      createDailyRotateTransport(`${logDir}/rejections-%DATE%.log`)
    ]
  };
}; 