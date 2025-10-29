import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Plan } from '../../plans/entities/plan.entity';

@Entity('usage')
export class Usage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid', { nullable: true })
  planId: string;

  @Column({ type: 'int', default: 0 })
  otpCount: number;

  @Column({ type: 'int', default: 0 })
  smtpCount: number;

  @Column({ type: 'int', default: 0 })
  templateCount: number;

  @Column({ type: 'int', default: 0 })
  apiKeyCount: number;

  @Column({ type: 'timestamp' })
  periodStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  periodEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.usages)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.usages)
  @JoinColumn({ name: 'planId' })
  plan: Plan;
}
