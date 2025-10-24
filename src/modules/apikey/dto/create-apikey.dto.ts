import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateApiKeyDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  smtpId: string; // Required SMTP config ID

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  label?: string; // Optional label to help user identify
}
