import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  fullName: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  planName?: string;
}
