import { HttpStatus } from '@nestjs/common';

export interface ErrorCodeInfo {
  code: string;
  message: string;
  status: HttpStatus;
}

export const ErrorCode = {
  // Auth
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: '인증이 필요합니다.',
    status: HttpStatus.UNAUTHORIZED,
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: '토큰이 만료되었습니다.',
    status: HttpStatus.UNAUTHORIZED,
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    message: '유효하지 않은 토큰입니다.',
    status: HttpStatus.UNAUTHORIZED,
  },
  REFRESH_TOKEN_INVALID: {
    code: 'REFRESH_TOKEN_INVALID',
    message: '유효하지 않은 리프레시 토큰입니다.',
    status: HttpStatus.UNAUTHORIZED,
  },
  REFRESH_TOKEN_EXPIRED: {
    code: 'REFRESH_TOKEN_EXPIRED',
    message: '리프레시 토큰이 만료되었습니다.',
    status: HttpStatus.UNAUTHORIZED,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: '접근 권한이 없습니다.',
    status: HttpStatus.FORBIDDEN,
  },

  // Common
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: '잘못된 요청입니다.',
    status: HttpStatus.BAD_REQUEST,
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: '리소스를 찾을 수 없습니다.',
    status: HttpStatus.NOT_FOUND,
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: '이미 존재하는 리소스입니다.',
    status: HttpStatus.CONFLICT,
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  // User
  NOT_FOUND_USER: {
    code: 'NOT_FOUND_USER',
    message: '사용자를 찾을 수 없습니다.',
    status: HttpStatus.NOT_FOUND,
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: '이미 존재하는 사용자입니다.',
    status: HttpStatus.CONFLICT,
  },
} as const satisfies Record<string, ErrorCodeInfo>;
