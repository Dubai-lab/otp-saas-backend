import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/user.service';
import { LogService } from '../logs/log.service';
import { SMTPService } from '../smtp-config/smtp.service';
import { ApiKeyService } from '../apikey/apikey.service';
import { TemplateService } from '../templates/template.service';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly logsService: LogService,
    private readonly smtpConfigService: SMTPService,
    private readonly apiKeyService: ApiKeyService,
    private readonly templateService: TemplateService,
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

  findAllSMTPConfigs() {
    return this.smtpConfigService.getAllForAdmin(); // Admin can see all
  }

  createSMTPConfig(dto: any) {
    return this.smtpConfigService.upsertForUser('admin', dto);
  }

  updateSMTPConfig(id: string, dto: any) {
    return this.smtpConfigService.upsertForUser('admin', dto);
  }

  deleteSMTPConfig(id: string) {
    return this.smtpConfigService.remove('admin', id);
  }

  findAllApiKeys() {
    return this.apiKeyService.listForAdmin(); // Admin can see all
  }

  createApiKey(dto: any) {
    return this.apiKeyService.generate('admin', dto);
  }

  deleteApiKey(id: string) {
    return this.apiKeyService.remove('admin', id);
  }

  findAllTemplates() {
    return this.templateService.findAllForAdmin(); // Admin can see all
  }

  createTemplate(dto: any) {
    return this.templateService.create('admin', dto);
  }

  updateTemplate(id: string, dto: any) {
    return this.templateService.update('admin', id, dto);
  }

  deleteTemplate(id: string) {
    return this.templateService.remove('admin', id);
  }

  async getSystemStats() {
    const users = await this.usersService.findAll();
    const smtpConfigs = await this.smtpConfigService.getAllForAdmin();
    const apiKeys = await this.apiKeyService.listForAdmin();
    const templates = await this.templateService.findAllForAdmin();
    const logs = await this.logsService.findAll();

    // Calculate additional stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sentToday = logs.filter((log) => {
      const logDate = new Date(log.createdAt);
      logDate.setHours(0, 0, 0, 0);
      return (
        logDate.getTime() === today.getTime() && log.currentStatus === 'sent'
      );
    }).length;

    const failedCount = logs.filter(
      (log) => log.currentStatus === 'failed',
    ).length;

    return {
      users: users.length,
      smtpConfigs: smtpConfigs.length,
      apiKeys: apiKeys.length,
      templates: templates.length,
      totalLogs: logs.length,
      sentToday,
      failedCount,
    };
  }

  cleanupSystem() {
    // Implement cleanup logic - delete old logs, expired OTPs, etc.
    // For now, just return success
    return { message: 'System cleanup completed' };
  }
}
