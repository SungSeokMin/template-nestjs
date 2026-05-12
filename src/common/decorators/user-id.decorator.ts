import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../exceptions/error-code.enum';

interface AuthenticatedRequest extends Request {
  user?: { userId: bigint };
}

export const UserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): bigint => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  const userId = request.user?.userId;

  if (!userId) {
    throw new BusinessException(ErrorCode.UNAUTHORIZED);
  }

  return userId;
});
