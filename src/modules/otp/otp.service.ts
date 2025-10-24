import { Injectable, BadRequestException } from '@nestjs/common';
import { ApiKeyService } from '../apikey/apikey.service';
import { SMTPService } from '../smtp-config/smtp.service';
import { TemplateService } from '../templates/template.service';
import * as nodemailer from 'nodemailer';
import { decryptSecret } from '../../common/utils/crypto.util';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LogService } from '../logs/log.service';

@Injectable()
export class OTPService {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly smtpService: SMTPService,
    private readonly templateService: TemplateService,
    private readonly logService: LogService,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async send(dto: SendOtpDto) {
    const user = await this.apiKeyService.validateById(dto.apiKeyId);
    if (!user) throw new BadRequestException('Invalid API Key');

    // Select SMTP config
    const smtps = await this.smtpService.getAllForUser(user.id);
    if (!smtps.length) {
      throw new BadRequestException('No SMTP configuration found for user');
    }
    const smtp = smtps[0];

    // Get full SMTP config with password
    const fullSmtp = await this.smtpService.getOneById(user.id, smtp.id);

    // Select Template
    const templates = await this.templateService.findAll(user.id);
    const template = templates.find((t) => t.name === dto.templateName);
    if (!template) throw new BadRequestException('Template not found');

    const otp = this.generateOtp();
    const html = template.body.replace('{{OTP}}', otp);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const transporter = nodemailer.createTransport({
      host: fullSmtp.host,
      port: fullSmtp.port,
      secure: fullSmtp.port === 465,
      auth: {
        user: fullSmtp.email,
        pass: decryptSecret(fullSmtp.passwordEncrypted), // ✅ correct field
      },
    });

    // Create initial "pending" log
    void this.logService.create({
      user,
      recipient: dto.recipient,
      otp,
      subject: template.subject,
      provider: fullSmtp.host,
      type: 'otp',
      status: 'pending',
      error: undefined,
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await transporter.sendMail({
        from: fullSmtp.email,
        to: dto.recipient,
        subject: template.subject,
        html,
      });
      void this.logService.create({
        user,
        recipient: dto.recipient,
        otp,
        subject: template.subject,
        provider: fullSmtp.host,
        type: 'otp',
        status: 'sent',
        error: undefined,
      });

      return { success: true, message: 'OTP sent', otp };
    } catch (e: any) {
      await this.logService.create({
        user,
        recipient: dto.recipient,
        otp,
        subject: template.subject,
        provider: fullSmtp.host,
        type: 'otp',
        status: 'failed',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        error: e.message,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException('OTP send failed: ' + e.message);
    }
  }

  async verify(dto: VerifyOtpDto) {
    const user = await this.apiKeyService.validateById(dto.apiKeyId);
    if (!user) throw new BadRequestException('Invalid API Key');

    // Find the most recent OTP log for this user with the provided OTP
    const recentLog = await this.logService.findRecentByOtp(user.id, dto.otp);

    if (!recentLog) {
      return { success: false, message: 'Invalid OTP' };
    }

    // Mark as verified
    await this.logService.updateStatus(recentLog.id, 'verified');

    return { success: true, message: 'OTP verified successfully' };
  }
}
