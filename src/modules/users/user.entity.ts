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
