import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';
import { buildError } from './buildError';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    // super.catch(exception,host)
    /* httpAdapter might not be available in all constructor, so resolving it */
    const { httpAdapter } = this.httpAdapterHost;

    const context = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = context.getResponse<Response>();

    console.log(exception);

    const responseBody = {
      success: false,
      data: {
        type: 'failure',
        statusCode:
          exception instanceof HttpException ? exception.getStatus() : 500,
        message:
          exception instanceof HttpException
            ? exception.message
            : buildError(exception).message,
        data: exception,
      },
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
