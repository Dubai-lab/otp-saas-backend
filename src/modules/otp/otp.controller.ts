import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OTPService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('otp')
@UseGuards(JwtAuthGuard)
export class OTPController {
  constructor(private readonly service: OTPService) {}

  @Post('send')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.service.send(dto);
  }

  @Post('verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.service.verify(dto);
  }
}
