import { ROLE, UserRole } from 'src/utils/constants';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 50 })
  firstname: string;

  @Column({ nullable: false, length: 50 })
  lastname: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, enum: UserRole })
  role: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
