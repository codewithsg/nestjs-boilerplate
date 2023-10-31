import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class ResponseHelper {
  sendSuccessRes(message: string, statusCode: HttpStatus, data?: object) {
    return {
      success: true,
      data: {
        type: 'success',
        message,
        data,
        statusCode,
      },
    };
  }
}
