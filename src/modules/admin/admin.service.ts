import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/user.service';
import { LogService } from '../logs/log.service';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly logsService: LogService,
  ) {}

  findAllUsers() {
    return this.usersService.findAll();
  }

  async updateUserRole(userId: string, dto: UpdateRoleDto) {
    const updated = await this.usersService.updateRole(userId, dto.role);

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Role updated', user: updated };
  }

  findAllLogs() {
    return this.logsService.findAll();
  }
}
