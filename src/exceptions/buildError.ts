import { HttpStatus } from '@nestjs/common';

/**
 * Build error response for validation errors.
 *
 * @param   {Error} err
 * @returns {Object}
 */

// export interface ResponseError {
//   isJoi: boolean;
//   isBoom: boolean;
//   output: { statusCode: number; payload: { message: string; error: string } };
//   detail: string;
//   message: string;
//   details: { message: string; path: string[] }[];
//   name: string;
//   column: string;
//   code: number;
//   status: number;
//   stack: string;
// }

export function buildError(err) {
  // JWT ERRORS
  // eslint-disable-next-line no-constant-condition
  if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    return {
      code: HttpStatus.UNAUTHORIZED,
      message: 'Unauthorize',
    };
  }

  // DB ERRORS
  if (err) {
    const code =
      typeof err.code === 'string'
        ? err.code
        : err.code
        ? err.code.toString()
        : null;
    if (code.startsWith('235')) {
      return handleDbError(code, err);
    }
  }

  // Validation errors
  // if (err.isJoi) {
  //   return {
  //     code: HttpStatus.BAD_REQUEST,
  //     message: 'Bad Request',
  //     details:
  //       err.details &&
  //       err.details.map((err) => {
  //         return {
  //           message: err.message,
  //           param: err.path.join('.'),
  //         };
  //       }),
  //   };
  // }

  // HTTP errors
  //   if (err.isBoom) {
  //     return {
  //       code: err.output.statusCode,
  //       message: err.output.payload.message || err.output.payload.error,
  //     };
  //   }

  //   // const outError = err.detail || err.message;
  //   // const alreadyExistError = outError.match(/(already exists)/gi);

  //   // Return INTERNAL_SERVER_ERROR for all other cases
  //   return {
  //     code: HttpStatus.INTERNAL_SERVER_ERROR,
  //     message: 'Invalid request. Please refresh the page and try again.',
  //   };
  // }

  function handleDbError(code: string, err) {
    let message = '';
    if (code === '23502') {
      message = `'${err.column}' should not be null`;

      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        // details: [],
      };
    } else if (code === '23505') {
      const regExp = /\(([^)]+)\)/g;
      const matches = err.detail.match(regExp);
      message = `${matches && matches[0]} with value ${matches && matches[1]
        } already exist`.replace(/["'()]/g, `'`);

      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
      };
    } else if (code === '23503') {
      const matches = err.detail.match(/"(.*?)"/g);

      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `${matches && matches[0]} doesnot exist`,
      };
    } else {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
      };
    }
  }
}
