import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsIn(['user', 'admin'])
  role: 'user' | 'admin';
}
