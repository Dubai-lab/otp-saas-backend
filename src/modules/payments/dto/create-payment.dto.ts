import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsString()
  userId: string;

  @IsString()
  planId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  stripePaymentIntentId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
