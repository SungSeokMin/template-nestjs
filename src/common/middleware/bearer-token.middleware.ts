import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtUtilService } from '../services/jwt-util.service';

interface AuthenticatedRequest extends Request {
  user?: { userId: bigint };
}

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(private readonly jwtUtilService: JwtUtilService) {}

  use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const authorization = req.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return next();
    }

    const token = authorization.split(' ')[1];

    try {
      const userId = this.jwtUtilService.getUserId(token);
      req.user = { userId };
    } catch {
      // 유효하지 않은 토큰 — 가드 레이어에서 인증 필요 여부 판단
    }

    next();
  }
}
