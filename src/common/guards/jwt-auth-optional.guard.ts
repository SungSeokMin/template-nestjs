import { CanActivate, Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthOptionalGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}
