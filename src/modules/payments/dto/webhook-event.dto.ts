import { IsString, IsObject } from 'class-validator';

export class WebhookEventDto {
  @IsString()
  type: string;

  @IsObject()
  data: any;
}
