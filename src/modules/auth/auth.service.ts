import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OTPService } from '../otp/otp.service';
import { PlanService } from '../plans/plan.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly otpService: OTPService,
    private readonly planService: PlanService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already in use');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hash = await bcrypt.hash(dto.password, 10);

    // Get default plan (Free plan) for new users, but handle gracefully if none exists
    let defaultPlanId: string | null = null;
    try {
      const defaultPlan = await this.planService.findDefaultPlan();
      defaultPlanId = defaultPlan.id;
    } catch {
      // If no default plan exists, leave planId as null
      // The plan service will handle fallback when needed
    }

    const user = await this.usersService.create({
      email: dto.email,
      fullName: dto.fullName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password: hash,
      role: 'user',
      planId: defaultPlanId, // Assign default plan if available, otherwise null
    });

    return {
      message: 'Registered successfully',
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwt.signAsync(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');

    // Use the hardcoded API key and template for password reset
    const apiKeyId = 'c50eb157-d5df-4eb6-a43a-a8b79929c0e7';
    const templateName = 'otp-email';

    await this.otpService.send({
      apiKeyId,
      recipient: dto.email,
      templateName,
    });

    return {
      message: 'Password reset OTP sent to your email',
      success: true,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Find the most recent OTP log for password reset (without user filter for forgot password)
    const recentLog = await this.otpService.findRecentByOtpForPasswordReset(
      dto.otp,
    );
    if (!recentLog) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Get user by email from the log
    const user = await this.usersService.findByEmail(recentLog.recipient);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash new password
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hash = await bcrypt.hash(dto.newPassword, 10);

    // Update user password
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    await this.usersService.update(user.id, { password: hash });

    // Mark OTP as verified
    await this.otpService.updateStatus(recentLog.id, 'verified');

    return {
      message: 'Password reset successfully',
      success: true,
    };
  }
}
