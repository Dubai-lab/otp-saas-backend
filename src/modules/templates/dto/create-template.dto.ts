import { IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateTemplateDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  body: string; // HTML content with placeholders like {{OTP}}

  @IsOptional()
  @IsObject()
  styles?: {
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
    footer?: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: string;
      fontFamily?: string;
    };
  };
}
