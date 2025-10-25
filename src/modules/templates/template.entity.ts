import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.templates, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  headerText: string;

  @Column({ type: 'text' })
  bodyText: string; // Text content with {{OTP}} placeholder

  @Column({ type: 'text' })
  footerText: string;

  @Column({ type: 'json', nullable: true })
  styles?: {
    header?: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: string;
      fontFamily?: string;
      borderRadius?: string;
      borderColor?: string;
      borderWidth?: string;
    };
    body?: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: string;
      fontFamily?: string;
    };
    otp?: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: string;
      padding?: string;
      borderRadius?: string;
      borderColor?: string;
      borderWidth?: string;
    };
    footer?: {
      backgroundColor?: string;
      textColor?: string;
      fontSize?: string;
      fontFamily?: string;
    };
  };

  @CreateDateColumn()
  createdAt: Date;
}
