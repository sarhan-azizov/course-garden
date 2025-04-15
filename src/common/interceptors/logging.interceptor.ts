import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { LoggerService } from '@/modules';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = context.switchToHttp().getResponse().statusCode;
          
          this.logger.log(
            `${method} ${url} ${statusCode} - ${duration}ms`, 
            'Interceptor Success', 
            {
              request: {
                method,
                url,
                body,
                query,
                params,
              },
              response: {
                statusCode,
                data: response,
              }
            }
          );
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.logger.error(
            `${method} ${url} - Error - ${duration}ms`,
            error.stack,
            'Interceptor Error',
            {
              request: {
                method,
                url,
                body,
                query,
                params,
              },
              error: {
                message: error.message,
                stack: error.stack,
              }
            }
          );
        }
      })
    );
  }
} 