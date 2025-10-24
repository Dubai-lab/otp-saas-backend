import { IsNotEmpty } from 'class-validator';

export class CreateTemplateDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  body: string; // HTML content with placeholders like {{OTP}}
}
