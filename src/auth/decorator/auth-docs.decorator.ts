import { HttpCode, HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from 'src/common/decorators/api-error-response.decorator';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { TokenResponseDto } from '../dto/token-response.dto';

export const ApiRefreshAuth = () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: '액세스 토큰 갱신',
      description: '리프레시 토큰을 검증하고 새 액세스/리프레시 토큰 페어를 발급합니다.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: '토큰 갱신 성공', type: TokenResponseDto }),
    ApiErrorResponse(ErrorCode.REFRESH_TOKEN_INVALID, ErrorCode.REFRESH_TOKEN_EXPIRED),
  );
