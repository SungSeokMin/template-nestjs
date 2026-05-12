import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { BearerTokenMiddleware } from './common/middleware/bearer-token.middleware';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const env = process.env.ENV;

        if (env === 'prod') return '.env.production';
        if (env === 'dev') return '.env.development';

        return '.env';
      })(),
      validationSchema: Joi.object({
        ENV: Joi.string().valid('local', 'dev', 'prod').required(),
        PORT: Joi.number().required(),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        HASH_ROUNDS: Joi.string().required(),
      }),
    }),
    CommonModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BearerTokenMiddleware).forRoutes('*');
  }
}
