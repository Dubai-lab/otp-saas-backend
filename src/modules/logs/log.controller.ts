import { Controller, Get, Logger, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LogService } from './log.service';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogController {
  private readonly logger = new Logger(LogController.name);

  constructor(private readonly service: LogService) {}

  @Get()
  findAll(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.findForUser(req.user.id);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.getStats(req.user.id);
  }

  @Get('welcome')
  welcome(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.logger.log(`Request received: ${req.method} ${req.path}`);
    return { message: 'Welcome to the OTP SaaS API!' };
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.findOne(req.user.id, id);
  }
}
