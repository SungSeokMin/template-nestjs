import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { envVariableKeys } from '../const/env.const';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../exceptions/error-code.enum';

export type TokenType = 'access' | 'refresh';

export interface TokenPayload {
  id: string;
  role: string;
  type: TokenType;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtUtilService {
  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>(envVariableKeys.jwtSecret) as string;
  }

  private static readonly TOKEN_EXPIRY = {
    access: '24h',
    refresh: '30d',
  } as const;

  createToken(userId: bigint, role: string, type: TokenType): string {
    const payload = { id: userId.toString(), role, type };

    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: JwtUtilService.TOKEN_EXPIRY[type],
    });
  }

  verifyToken(token: string, type: TokenType): TokenPayload {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: this.jwtSecret,
      });

      if (payload.type !== type) {
        throw new BusinessException(this.getInvalidTokenError(type));
      }

      return payload;
    } catch (error) {
      if (error instanceof BusinessException) throw error;
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new BusinessException(this.getExpiredTokenError(type));
      }
      throw new BusinessException(this.getInvalidTokenError(type));
    }
  }

  getUserId(token: string): bigint {
    const payload = this.verifyToken(token, 'access');
    return BigInt(payload.id);
  }

  getExpiresAt(token: string): Date {
    const payload = this.jwtService.decode<TokenPayload>(token);
    return new Date(payload.exp * 1000);
  }

  private getInvalidTokenError(type: TokenType) {
    return type === 'refresh' ? ErrorCode.REFRESH_TOKEN_INVALID : ErrorCode.TOKEN_INVALID;
  }

  private getExpiredTokenError(type: TokenType) {
    return type === 'refresh' ? ErrorCode.REFRESH_TOKEN_EXPIRED : ErrorCode.TOKEN_EXPIRED;
  }
}
