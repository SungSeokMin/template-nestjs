import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
import { JwtUtilService } from './services/jwt-util.service';
import { PrismaService } from './services/prisma.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtAuthOptionalGuard } from './guards/jwt-auth-optional.guard';
import { BearerTokenMiddleware } from './middleware/bearer-token.middleware';

@Global()
@Module({
  imports: [WinstonModule.forRootAsync({ useFactory: winstonConfig }), JwtModule.register({})],
  providers: [
    PrismaService,
    JwtUtilService,
    JwtAuthGuard,
    JwtAuthOptionalGuard,
    BearerTokenMiddleware,
  ],
  exports: [
    PrismaService,
    JwtUtilService,
    JwtAuthGuard,
    JwtAuthOptionalGuard,
    BearerTokenMiddleware,
    JwtModule,
  ],
})
export class CommonModule {}
