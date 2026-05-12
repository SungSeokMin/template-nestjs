import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshDto } from './dto/refresh.dto';
import { ApiRefreshAuth } from './decorator/auth-docs.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @ApiRefreshAuth()
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshAuth(dto);
  }
}
