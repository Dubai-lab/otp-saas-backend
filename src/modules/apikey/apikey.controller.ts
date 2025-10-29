import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiKeyService } from './apikey.service';
import { CreateApiKeyDto } from './dto/create-apikey.dto';
import { UsageService } from '../usage/usage.service';

@Controller('apikeys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  constructor(
    private readonly service: ApiKeyService,
    private readonly usageService: UsageService,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateApiKeyDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.id as string;

    // Check if user has reached API key limit
    const hasReachedLimit = await this.usageService.checkUsageLimit(
      userId,
      'apiKey',
    );
    if (hasReachedLimit) {
      throw new BadRequestException('API key limit reached for your plan');
    }

    const result = await this.service.generate(userId, dto);

    // Increment usage count
    await this.usageService.incrementUsage(userId, 'apiKey');

    return result;
  }

  @Get()
  list(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.list(req.user.id);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.remove(req.user.id, id);
  }
}
