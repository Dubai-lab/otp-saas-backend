import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { SMTPService } from './smtp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSmtpDto } from './dto/create-smtp.dto';
import { UpdateSmtpDto } from './dto/update-smtp.dto';
import { UsageService } from '../usage/usage.service';

@Controller('smtp')
@UseGuards(JwtAuthGuard)
export class SMTPController {
  constructor(
    private readonly service: SMTPService,
    private readonly usageService: UsageService,
  ) {}

  @Get()
  getAll(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.getAllForUser(req.user.id);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.getOneById(req.user.id, id);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateSmtpDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.id as string;

    // Check if user has reached SMTP limit
    const hasReachedLimit = await this.usageService.checkUsageLimit(
      userId,
      'smtp',
    );
    if (hasReachedLimit) {
      throw new BadRequestException(
        'SMTP configuration limit reached for your plan',
      );
    }

    const result = await this.service.upsertForUser(userId, dto);

    // Increment usage count
    await this.usageService.incrementUsage(userId, 'smtp');

    return result;
  }

  @Put(':id')
  update(
    @Req() req: any,
    @Param('id') _id: string,
    @Body() dto: UpdateSmtpDto,
  ) {
    // We upsert by name; client can send the same name to overwrite
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.upsertForUser(req.user.id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.remove(req.user.id, id);
  }
}
