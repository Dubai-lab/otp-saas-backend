import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsNotEmpty, IsObject } from 'class-validator';
import { CreateTemplateDto } from './create-template.dto';

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  subject?: string;

  @IsOptional()
  @IsNotEmpty()
  body?: string;

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
