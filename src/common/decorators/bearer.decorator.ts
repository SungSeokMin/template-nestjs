import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export const BearerRequired = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: '인증 토큰이 필요합니다.' }),
  );

export const BearerOptional = () => applyDecorators(ApiBearerAuth());
