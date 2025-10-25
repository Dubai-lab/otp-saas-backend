import { Injectable, BadRequestException } from '@nestjs/common';
import { ApiKeyService } from '../apikey/apikey.service';
import { SMTPService } from '../smtp-config/smtp.service';
import { TemplateService } from '../templates/template.service';
import * as nodemailer from 'nodemailer';
import { decryptSecret } from '../../common/utils/crypto.util';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LogService } from '../logs/log.service';

type TemplateStyles = {
  header?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    fontFamily?: string;
    borderRadius?: string;
    borderColor?: string;
    borderWidth?: string;
  };
  body?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    fontFamily?: string;
  };
  otp?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    padding?: string;
    borderRadius?: string;
    borderColor?: string;
    borderWidth?: string;
  };
  footer?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    fontFamily?: string;
  };
};

type TemplateWithStyles = {
  subject: string;
  styles?: TemplateStyles;
};

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
    const html = this.generateEmailHtml(template, otp);

    // Build nodemailer transporter with safe timeouts and optional debug
    const debug = process.env.SMTP_DEBUG === 'true';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const transporter = nodemailer.createTransport({
      host: fullSmtp.host,
      port: fullSmtp.port,
      secure: fullSmtp.port === 465,
      auth: {
        user: fullSmtp.email,
        pass: decryptSecret(fullSmtp.passwordEncrypted), // ✅ correct field
      },
      connectionTimeout: 10000, // 10s fail-fast
      greetingTimeout: 5000, // 5s
      socketTimeout: 10000, // 10s
      logger: debug,
      debug,
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

  async findRecentByOtpForPasswordReset(otp: string) {
    return this.logService.findRecentByOtpForPasswordReset(otp);
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'sent' | 'failed' | 'verified',
  ) {
    return this.logService.updateStatus(id, status);
  }

  private generateEmailHtml(
    template: TemplateWithStyles & {
      styles?: TemplateStyles;
      headerText: string;
      bodyText: string;
      footerText: string;
    },
    otp: string,
  ): string {
    const styles = template.styles || {};
    const headerStyles = styles.header || {};
    const bodyStyles = styles.body || {};
    const otpStyles = styles.otp || {};
    const footerStyles = styles.footer || {};

    const bodyContent = template.bodyText.replace('{{OTP}}', otp);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: ${bodyStyles.fontFamily || 'Arial, sans-serif'}; background-color: #f4f4f4;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
          <tr>
            <td align="center" style="padding: 20px;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: ${headerStyles.backgroundColor || '#4F46E5'}; color: ${headerStyles.textColor || '#ffffff'}; font-size: ${headerStyles.fontSize || '24px'}; font-weight: 700; font-family: ${headerStyles.fontFamily || 'Arial, sans-serif'}; text-align: center; padding: 20px; border-radius: ${headerStyles.borderRadius || '8px 8px 0 0'}; border: ${headerStyles.borderWidth || '0px'} solid ${headerStyles.borderColor || '#000000'};">
                    ${template.headerText}
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="background-color: ${bodyStyles.backgroundColor || '#ffffff'}; color: ${bodyStyles.textColor || '#333333'}; font-size: ${bodyStyles.fontSize || '14px'}; font-family: ${bodyStyles.fontFamily || 'Arial, sans-serif'}; padding: 40px; text-align: left;">
                    <p>${bodyContent}</p>
                    <div style="text-align: center; margin: 20px 0;">
                      <div style="display: inline-block; background-color: ${otpStyles.backgroundColor || '#F5F5F5'}; color: ${otpStyles.textColor || '#4F46E5'}; font-size: ${otpStyles.fontSize || '28px'}; font-weight: bold; padding: ${otpStyles.padding || '16px 20px'}; border-radius: ${otpStyles.borderRadius || '8px'}; border: ${otpStyles.borderWidth || '1px'} solid ${otpStyles.borderColor || '#ddd'};">
                        ${otp}
                      </div>
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: ${footerStyles.backgroundColor || '#F9FAFB'}; color: ${footerStyles.textColor || '#666666'}; font-size: ${footerStyles.fontSize || '12px'}; font-family: ${footerStyles.fontFamily || 'Arial, sans-serif'}; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
                    <p>${template.footerText}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
