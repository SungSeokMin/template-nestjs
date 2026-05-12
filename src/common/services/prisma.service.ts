import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  declare $connect: () => Promise<void>;

  async onModuleInit() {
    await this.$connect();
  }
}
