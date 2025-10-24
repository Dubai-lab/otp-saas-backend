import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { SMTPConfig } from '../smtp-config/smtp.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.apiKeys, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => SMTPConfig, { onDelete: 'CASCADE' })
  smtpConfig: SMTPConfig;

  @Column({ unique: true })
  keyHash: string;

  @Column({ nullable: true })
  label: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
