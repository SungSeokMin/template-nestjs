import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipLogging } from './common/decorators/skip-logging.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @SkipLogging()
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
