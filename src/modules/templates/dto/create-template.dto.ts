import { IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateTemplateDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty()
  headerText: string;

  @IsNotEmpty()
  bodyText: string; // Text content with {{OTP}} placeholder

  @IsNotEmpty()
  footerText: string;

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
}
