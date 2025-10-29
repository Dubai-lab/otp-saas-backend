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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UsageService } from '../usage/usage.service';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplateController {
  constructor(
    private readonly service: TemplateService,
    private readonly usageService: UsageService,
  ) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateTemplateDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.id as string;

    // Check if user has reached template limit
    const hasReachedLimit = await this.usageService.checkUsageLimit(
      userId,
      'template',
    );
    if (hasReachedLimit) {
      throw new BadRequestException('Template limit reached for your plan');
    }

    const result = await this.service.create(userId, dto);

    // Increment usage count
    await this.usageService.incrementUsage(userId, 'template');

    return result;
  }

  @Get()
  list(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.findAll(req.user.id);
  }

  @Put(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.remove(req.user.id, id);
  }
}
