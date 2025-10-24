import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendLog } from '../logs/log.entity';
import { ApiKeyService } from '../apikey/apikey.service';
import { SMTPService } from '../smtp-config/smtp.service';
import { TemplateService } from '../templates/template.service';
import * as nodemailer from 'nodemailer';
import { decryptSecret } from '../../common/utils/crypto.util';
import { SendOtpDto } from './dto/send-otp.dto';

@Injectable()
export class OTPService {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly smtpService: SMTPService,
    private readonly templateService: TemplateService,

    @InjectRepository(SendLog)
    private readonly repo: Repository<SendLog>,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async send(dto: SendOtpDto) {
    const user = await this.apiKeyService.validate(dto.apiKey);
    if (!user) throw new BadRequestException('Invalid API Key');

    const smtps = await this.smtpService.getAllForUser(user.id);
    if (!smtps.length)
      throw new BadRequestException('No SMTP configuration found for user');

    const smtp = smtps[0]; // first config for now — later allow selection

    const templates = await this.templateService.findAll(user.id);
    const template = templates.find((t) => t.name === dto.templateName);
    if (!template) throw new BadRequestException('Template not found');

    const otp = this.generateOtp();
    const html = template.body.replace('{{OTP}}', otp);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: {
        user: smtp.email,

        pass: decryptSecret(smtp.password),
      },
    });

    const log = this.repo.create({
      user,
      recipient: dto.recipient,
      otp,
      status: 'pending',
    });
    await this.repo.save(log);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await transporter.sendMail({
        from: smtp.email,
        to: dto.recipient,
        subject: template.subject,
        html,
      });

      log.status = 'sent';
      await this.repo.save(log);

      return { success: true, message: 'OTP sent', otp }; // ✅ backend shows OTP only for debug/testing
    } catch (e: any) {
      log.status = 'failed';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      log.error = e.message;
      await this.repo.save(log);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException('OTP send failed: ' + e.message);
    }
  }
}
