import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';
import { ManageGlobalExceptions } from './errors/manage-global-exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = new ManageGlobalExceptions(request.url, exception);

    response.status(errorResponse.status).json({
      path: errorResponse.path,
      statusCode: errorResponse.status,
      error: errorResponse.error,
      details: errorResponse.details,
      timestamp: errorResponse.timestamp,
      errors: errorResponse.errors,
    });
  }
}
