import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';

    this.logger.log(
      `[Before] ${method} ${originalUrl} | IP: ${ip} | UA: ${userAgent}`,
    );

    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(
        `[After] ${method} ${originalUrl} | ${res.statusCode} | ${duration}ms`,
      );
    });

    next();
  }
}