import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../exceptions/error-code.enum';

interface AuthenticatedRequest extends Request {
  user?: { userId: bigint };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user?.userId) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }

    return true;
  }
}
