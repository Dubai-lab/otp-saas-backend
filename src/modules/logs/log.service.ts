import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendLog } from './log.entity';
import { User } from '../users/user.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(SendLog)
    private readonly repo: Repository<SendLog>,
  ) {}

  create(data: {
    user: User;
    recipient: string;
    otp?: string;
    subject: string;
    provider: string;
    type: 'otp' | 'email';
    status: 'pending' | 'sent' | 'failed' | 'verified';
    error?: string;
  }) {
    const log = this.repo.create({
      ...data,
      currentStatus: data.status,
      statuses: [
        {
          status: data.status,
          timestamp: new Date().toISOString(),
          error: data.error,
        },
      ],
    });
    return this.repo.save(log);
  }

  findAll() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }

  findForUser(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const log = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!log) throw new NotFoundException('Log not found');
    return log;
  }

  async getStats(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [smtpCount] = await this.repo.query(
      `SELECT COUNT(*) as count FROM smtp_configs WHERE "userId" = $1`,
      [userId],
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [templateCount] = await this.repo.query(
      `SELECT COUNT(*) as count FROM templates WHERE "userId" = $1`,
      [userId],
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [apiKeyCount] = await this.repo.query(
      `SELECT COUNT(*) as count FROM api_keys WHERE "userId" = $1`,
      [userId],
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [sentToday] = await this.repo.query(
      `SELECT COUNT(*) as count FROM send_logs WHERE "userId" = $1 AND DATE("createdAt") = CURRENT_DATE`,
      [userId],
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [failedCount] = await this.repo.query(
      `SELECT COUNT(*) as count FROM send_logs WHERE "userId" = $1 AND "currentStatus" = 'failed'`,
      [userId],
    );

    // Get user's plan limit for OTPs
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [userPlan] = await this.repo.query(
      `SELECT p."otpLimit" FROM users u LEFT JOIN plans p ON u."planId" = p.id WHERE u.id = $1`,
      [userId],
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-type-assertion
    const otpLimit = (userPlan as any)?.otpLimit || 100; // Default to 100 if no plan found

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      smtpCount: parseInt(smtpCount.count),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      templateCount: parseInt(templateCount.count),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      apiKeyCount: parseInt(apiKeyCount.count),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      sentToday: parseInt(sentToday.count),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      failedCount: parseInt(failedCount.count),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      otpLimit,
    };
  }

  async findRecentByOtp(userId: string, otp: string) {
    return this.repo.findOne({
      where: {
        user: { id: userId },
        otp,
        currentStatus: 'sent',
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findRecentByOtpForPasswordReset(otp: string) {
    return this.repo.findOne({
      where: {
        otp,
        currentStatus: 'sent',
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'sent' | 'failed' | 'verified',
  ) {
    const log = await this.repo.findOne({ where: { id } });
    if (!log) return;

    const newStatus = {
      status,
      timestamp: new Date().toISOString(),
    };

    await this.repo.update(id, {
      currentStatus: status,
      statuses: [...log.statuses, newStatus],
    });
  }
}
