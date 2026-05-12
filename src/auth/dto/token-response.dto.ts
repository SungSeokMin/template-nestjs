import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: '액세스 토큰 (24h)' })
  accessToken: string;

  @ApiProperty({ description: '리프레시 토큰 (30d)' })
  refreshToken: string;
}
