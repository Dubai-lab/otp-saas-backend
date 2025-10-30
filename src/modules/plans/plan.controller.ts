import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('plans')
@UseGuards(RolesGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Roles('admin')
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @Get()
  findAll() {
    return this.planService.findAll();
  }

  @Get('default')
  findDefault() {
    return this.planService.findDefaultPlan();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planService.findOne(id);
  }

  @Get('current')
  findCurrent(@CurrentUser() user: any) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      return this.planService.findCurrentUserPlan(user.id);
    } catch (error) {
      console.error('Error fetching current user plan:', error);
      throw error;
    }
  }

  @Patch(':id')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Roles('admin')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.update(id, updatePlanDto);
  }

  @Delete(':id')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.planService.remove(id);
  }
}
