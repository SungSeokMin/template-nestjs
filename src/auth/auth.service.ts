import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { JwtUtilService } from 'src/common/services/jwt-util.service';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { ErrorCode } from 'src/common/exceptions/error-code.enum';
import { RefreshDto } from './dto/refresh.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtUtil: JwtUtilService,
    private readonly prisma: PrismaService,
  ) {}

  async refreshAuth(dto: RefreshDto): Promise<TokenResponseDto> {
    const payload = this.jwtUtil.verifyToken(dto.refreshToken, 'refresh');
    const userId = BigInt(payload.id);

    const user = await this.prisma.user.findFirst({
      where: { id: userId, isActive: true, refreshToken: dto.refreshToken },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
    }

    const accessToken = this.jwtUtil.createToken(user.id, user.role, 'access');
    const refreshToken = this.jwtUtil.createToken(user.id, user.role, 'refresh');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
}
