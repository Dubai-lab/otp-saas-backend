import { PartialType } from '@nestjs/mapped-types';
import { CreateSmtpDto } from './create-smtp.dto';

export class UpdateSmtpDto extends PartialType(CreateSmtpDto) {}
