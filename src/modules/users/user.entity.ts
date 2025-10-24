import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SMTPConfig } from '../smtp-config/smtp.entity';
import { Template } from '../templates/template.entity';
import { ApiKey } from '../apikey/apikey.entity';
import { EmailLog } from '../logs/log.entity';
import { OTP } from '../otp/otp.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: 'user' | 'admin';

  @OneToMany(() => SMTPConfig, (smtp) => smtp.user)
  smtpConfigs: SMTPConfig[];

  @OneToMany(() => Template, (template) => template.user)
  templates: Template[];

  @OneToMany(() => ApiKey, (key) => key.user)
  apiKeys: ApiKey[];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @OneToMany(() => EmailLog, (log) => log.user)
  emailLogs: EmailLog[];

  @OneToMany(() => OTP, (otp) => otp.user)
  otps: OTP[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
