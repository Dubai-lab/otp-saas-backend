import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usage } from './entities/usage.entity';
import { User } from '../users/user.entity';
import { Plan } from '../plans/entities/plan.entity';

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(Usage)
    private readonly usageRepository: Repository<Usage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async createForUser(userId: string): Promise<Usage> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['plan'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's plan or default plan
    let plan: Plan | null = user.plan;
    if (!plan) {
      plan = await this.planRepository.findOne({
        where: { isDefault: true },
      });

      if (!plan) {
        throw new NotFoundException('Default plan not found');
      }

      // Assign default plan to user
      user.planId = plan.id;
      await this.userRepository.save(user);
    }

    // Check if usage record already exists for current period
    const existingUsage = await this.usageRepository.findOne({
      where: {
        userId,
        planId: plan.id,
        periodStart: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ), // Start of current month
      },
    });

    if (existingUsage) {
      return existingUsage;
    }

    // Create new usage record
    const usage = this.usageRepository.create({
      userId,
      planId: plan.id,
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    });

    return this.usageRepository.save(usage);
  }

  async getUsageForUser(userId: string): Promise<Usage> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['plan'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let usage = await this.usageRepository.findOne({
      where: {
        userId,
        periodStart: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ),
      },
      relations: ['plan'],
    });

    if (!usage) {
      usage = await this.createForUser(userId);
    }

    return usage;
  }

  async incrementUsage(
    userId: string,
    type: 'otp' | 'smtp' | 'template' | 'apiKey',
  ): Promise<Usage> {
    const usage = await this.getUsageForUser(userId);

    switch (type) {
      case 'otp':
        usage.otpCount += 1;
        break;
      case 'smtp':
        usage.smtpCount += 1;
        break;
      case 'template':
        usage.templateCount += 1;
        break;
      case 'apiKey':
        usage.apiKeyCount += 1;
        break;
    }

    return this.usageRepository.save(usage);
  }

  async checkUsageLimit(
    userId: string,
    type: 'otp' | 'smtp' | 'template' | 'apiKey',
  ): Promise<boolean> {
    const usage = await this.getUsageForUser(userId);

    if (!usage.plan) {
      return false; // No plan means no limits
    }

    switch (type) {
      case 'otp':
        return usage.otpCount >= usage.plan.otpLimit;
      case 'smtp':
        return usage.smtpCount >= usage.plan.smtpLimit;
      case 'template':
        return usage.templateCount >= usage.plan.templateLimit;
      case 'apiKey':
        return usage.apiKeyCount >= usage.plan.apiKeyLimit;
      default:
        return false;
    }
  }

  async getUsageStats(userId: string): Promise<{
    current: Usage;
    limits: {
      otp: number;
      smtp: number;
      template: number;
      apiKey: number;
    };
    usage: {
      otp: number;
      smtp: number;
      template: number;
      apiKey: number;
    };
  }> {
    const usage = await this.getUsageForUser(userId);

    return {
      current: usage,
      limits: {
        otp: usage.plan?.otpLimit || 0,
        smtp: usage.plan?.smtpLimit || 0,
        template: usage.plan?.templateLimit || 0,
        apiKey: usage.plan?.apiKeyLimit || 0,
      },
      usage: {
        otp: usage.otpCount,
        smtp: usage.smtpCount,
        template: usage.templateCount,
        apiKey: usage.apiKeyCount,
      },
    };
  }
}
