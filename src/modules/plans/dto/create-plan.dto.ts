import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0)
  otpLimit: number;

  @IsNumber()
  @Min(0)
  smtpLimit: number;

  @IsNumber()
  @Min(0)
  templateLimit: number;

  @IsNumber()
  @Min(0)
  apiKeyLimit: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}
