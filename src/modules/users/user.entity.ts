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
import { SendLog } from '../logs/log.entity';

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

  @Column({ type: 'varchar', default: 'user' })
  role: 'user' | 'admin';

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'int', default: 30 })
  sessionTimeout: number;

  @Column({ type: 'boolean', default: true })
  loginNotifications: boolean;

  @Column({ type: 'varchar', nullable: true })
  recoveryEmail?: string;

  @Column({ type: 'varchar', nullable: true })
  recoveryPhone?: string;

  @OneToMany(() => SMTPConfig, (smtp) => smtp.user)
  smtpConfigs: SMTPConfig[];

  @OneToMany(() => Template, (template) => template.user)
  templates: Template[];

  @OneToMany(() => ApiKey, (key) => key.user)
  apiKeys: ApiKey[];

  @OneToMany(() => SendLog, (log) => log.user)
  logs: SendLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
