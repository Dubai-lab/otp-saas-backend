import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePlanDto } from '../plans/dto/create-plan.dto';
import { UpdatePlanDto } from '../plans/dto/update-plan.dto';

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

  @Get('otp-logs')
  getOtpLogs() {
    return this.service.findAllLogs();
  }

  @Get('smtp')
  getAllSMTPConfigs() {
    return this.service.findAllSMTPConfigs();
  }

  @Post('smtp')
  createSMTPConfig(@Body() dto: any) {
    return this.service.createSMTPConfig(dto);
  }

  @Patch('smtp/:id')
  updateSMTPConfig(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateSMTPConfig(id, dto);
  }

  @Delete('smtp/:id')
  deleteSMTPConfig(@Param('id') id: string) {
    return this.service.deleteSMTPConfig(id);
  }

  @Get('apikeys')
  getAllApiKeys() {
    return this.service.findAllApiKeys();
  }

  @Post('apikeys')
  createApiKey(@Body() dto: any) {
    return this.service.createApiKey(dto);
  }

  @Delete('apikeys/:id')
  deleteApiKey(@Param('id') id: string) {
    return this.service.deleteApiKey(id);
  }

  @Get('templates')
  getAllTemplates() {
    return this.service.findAllTemplates();
  }

  @Post('templates')
  createTemplate(@Body() dto: any) {
    return this.service.createTemplate(dto);
  }

  @Patch('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.service.deleteTemplate(id);
  }

  @Get('stats')
  getSystemStats() {
    return this.service.getSystemStats();
  }

  @Post('cleanup')
  cleanupSystem() {
    return this.service.cleanupSystem();
  }

  // Plan management endpoints
  @Get('plans')
  getAllPlans() {
    return this.service.findAllPlans();
  }

  @Post('plans')
  createPlan(@Body() dto: CreatePlanDto) {
    return this.service.createPlan(dto);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.service.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.service.deletePlan(id);
  }

  @Delete('user/:id')
  deleteUser(@Param('id') id: string) {
    return this.service.deleteUser(id);
  }

  @Patch('user/:id/plan')
  updateUserPlan(@Param('id') id: string, @Body() dto: { planId: string }) {
    return this.service.updateUserPlan(id, dto.planId);
  }

  @Post('assign-default-plans')
  assignDefaultPlans() {
    return this.service.assignDefaultPlanToExistingUsers();
  }
}
