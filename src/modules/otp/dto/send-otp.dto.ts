import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendOtpDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEmail()
  recipient: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty()
  templateName: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty()
  apiKey: string;
}
