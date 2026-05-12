/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { SKIP_LOGGING_KEY } from '../decorators/skip-logging.decorator';

const BOT_UA_PATTERN =
  /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|sogou|exabot|facebot|ia_archiver/i;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly isProd = process.env.ENV === 'prod';

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_LOGGING_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return next.handle();

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;

    const ua = request.headers['user-agent'] ?? '';
    if (BOT_UA_PATTERN.test(ua)) return next.handle();

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        const status = response.statusCode;

        if (this.isProd) {
          this.logger.log(`${method} ${url} ${status} ${ms}ms`);
        } else {
          const { params, query, body } = request;
          this.logger.debug(
            `${method} ${url} ${status} ${ms}ms\n` +
              `  params: ${JSON.stringify(params)}\n` +
              `  query:  ${JSON.stringify(query)}\n` +
              `  body:   ${JSON.stringify(body)}`,
          );
        }
      }),
    );
  }
}
