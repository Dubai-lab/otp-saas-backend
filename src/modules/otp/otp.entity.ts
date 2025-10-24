import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('otps')
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.otps)
  user: User;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column({ default: false })
  verified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
