import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorCodeInfo } from '../exceptions/error-code.enum';

export const ApiErrorResponse = (...errors: ErrorCodeInfo[]) =>
  applyDecorators(
    ...errors.map((error) =>
      ApiResponse({
        status: error.status,
        description: `${error.code}: ${error.message}`,
        schema: {
          type: 'object',
          properties: {
            code: { type: 'string', example: error.code },
            message: { type: 'string', example: error.message },
          },
        },
      }),
    ),
  );
