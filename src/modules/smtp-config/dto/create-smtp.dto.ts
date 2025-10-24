import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsEmail,
  Min,
  Max,
} from 'class-validator';

export class CreateSmtpDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string; // plain in request; will be encrypted before saving
}
