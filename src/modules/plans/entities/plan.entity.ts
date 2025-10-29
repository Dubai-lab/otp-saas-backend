import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Usage } from '../../usage/entities/usage.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { User } from '../../users/user.entity';

@Entity('plan')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'int' })
  otpLimit: number;

  @Column({ type: 'int' })
  smtpLimit: number;

  @Column({ type: 'int' })
  templateLimit: number;

  @Column({ type: 'int' })
  apiKeyLimit: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Usage, (usage) => usage.plan)
  usages: Usage[];

  @OneToMany(() => Payment, (payment) => payment.plan)
  payments: Payment[];

  @OneToMany(() => User, (user) => user.plan)
  users: User[];
}
