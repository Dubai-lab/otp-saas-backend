import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('smtp_configs')
export class SMTPConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.smtpConfigs, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @Column()
  host: string;

  @Column()
  port: number;

  @Column()
  email: string;

  @Column()
  passwordEncrypted: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
