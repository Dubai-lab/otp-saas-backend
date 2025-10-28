import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export interface LogStatus {
  status: 'pending' | 'sent' | 'failed' | 'verified';
  timestamp: string;
  error?: string;
}

@Entity('send_logs')
export class SendLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  recipient: string;

  @Column()
  provider: string; // e.g. smtp.gmail.com or AWS SES later

  @Column()
  type: 'otp' | 'email';

  @Column()
  subject: string;

  @Column({ nullable: true })
  otp?: string;

  @Column({ type: 'json', default: [] })
  statuses: LogStatus[];

  @Column({ default: 'pending' })
  currentStatus: 'pending' | 'sent' | 'failed' | 'verified';

  @Column({ nullable: true })
  error?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
