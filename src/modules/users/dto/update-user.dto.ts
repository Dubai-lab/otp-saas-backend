import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsEmail,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

export class UpdateSecurityDto {
  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @IsInt()
  @Min(5)
  @Max(480)
  @IsOptional()
  sessionTimeout?: number;

  @IsBoolean()
  @IsOptional()
  loginNotifications?: boolean;

  @IsEmail()
  @IsOptional()
  recoveryEmail?: string;

  @IsString()
  @IsOptional()
  recoveryPhone?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @IsOptional()
  newPassword: string;
}
