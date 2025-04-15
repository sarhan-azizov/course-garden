import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { EnumModules } from '../../types';
import { THttpExceptionBody } from './http.exception.type';

export class ManageGlobalExceptions {
  private readonly logger = new Logger(ManageGlobalExceptions.name);

  path: string;
  error: string;
  details: string;
  status: number;
  timestamp: Date;
  errors?: any[];

  constructor(
    path: string,
    exception:
      | Error
      | HttpException
      | CustomBusinessException,
  ) {
    this.path = path;
    this.status = this.getStatusCode(exception);
    this.details = this.getErrorDetails(exception);
    this.error = this.getError(this.status);
    this.timestamp = new Date();
    this.errors = this.getErrors(exception);
  }

  private getErrors(exception: Error | HttpException | CustomBusinessException): any[] | undefined {
    if (exception instanceof CustomBusinessException || exception instanceof CustomException) {
      return exception.errors;
    }
    return undefined;
  }
  
  public getStatusCode(
    exception:
      | Error
      | HttpException
      | CustomBusinessException,
  ): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (exception instanceof CustomBusinessException) {
      return exception.httpCode || HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  public getErrorDetails(
    exception:
      | Error
      | HttpException
      | CustomBusinessException,
  ): string {
    this.logger.error(JSON.stringify({
      name: exception.name,
      message: exception.message,
      status: this.getStatusCode(exception),
    }, null, 2));

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse() as THttpExceptionBody;
      return Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message[0]
        : exceptionResponse.message;
    }
    if (exception instanceof CustomBusinessException) {
      return exception.message;
    }
    return 'Internal Server Error';
  }

  public getError(status: number): string {
    return (
      new Map<number, string>([
        [400, 'Bad Request'],
        [422, 'Unprocessable Entity'],
        [404, 'Not Found'],
        [401, 'Unauthorized'],
        [403, 'Forbidden'],
        [502, 'Bad Gateway'],
        [405, 'Method Not Allowed'],
        [409, 'Conflict'],
      ]).get(status) ?? 'Internal Server Error'
    );
  }
}

export class CustomException extends Error {
  constructor(message: string, publicentity: EnumModules, public exception: unknown, public errors?: any[]) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CustomBusinessException extends CustomException {
  constructor(
    message: string,
    entity: EnumModules,
    public httpCode?: number,
    public errors?: any[],
  ) {
    super(message, entity, null, errors);
  }
}

