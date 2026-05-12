import { HttpException } from '@nestjs/common';
import { ErrorCodeInfo } from './error-code.enum';

export class BusinessException extends HttpException {
  constructor(error: ErrorCodeInfo) {
    super({ code: error.code, message: error.message }, error.status);
  }
}
