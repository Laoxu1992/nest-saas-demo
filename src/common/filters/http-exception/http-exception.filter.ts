import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const errResponse = exception.getResponse();
    res.status(status).json({
      code: status,
      message:
        typeof errResponse === 'string'
          ? errResponse
          : (errResponse as { message: string }).message,
      data: null,
    });
  }
}
