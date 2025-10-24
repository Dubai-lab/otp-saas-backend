import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  apiKeyId: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
