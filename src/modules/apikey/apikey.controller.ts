import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiKeyService } from './apikey.service';
import { CreateApiKeyDto } from './dto/create-apikey.dto';

@Controller('apikeys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  constructor(private readonly service: ApiKeyService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateApiKeyDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.generate(req.user.id, dto);
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
