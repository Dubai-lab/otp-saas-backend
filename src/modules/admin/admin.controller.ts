import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('users')
  getUsers() {
    return this.service.findAllUsers();
  }

  @Patch('user/:id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.updateUserRole(id, dto);
  }

  @Get('logs')
  getLogs() {
    return this.service.findAllLogs();
  }
}
