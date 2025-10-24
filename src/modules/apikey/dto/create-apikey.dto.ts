import { IsOptional, IsString } from 'class-validator';

export class CreateApiKeyDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  label?: string; // Optional label to help user identify
}
