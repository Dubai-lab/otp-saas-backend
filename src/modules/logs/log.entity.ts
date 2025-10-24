import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

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

  @Column({ default: 'pending' })
  status: 'pending' | 'sent' | 'failed' | 'verified';

  @Column({ nullable: true })
  error?: string;

  @CreateDateColumn()
  createdAt: Date;
}
