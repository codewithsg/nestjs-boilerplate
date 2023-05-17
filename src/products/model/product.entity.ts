import { User } from 'src/users/model/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 50 })
  name: string;

  @Column({ nullable: true, length: 500 })
  description: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: false })
  quantity: number;

  @Column({ nullable: true, type: 'simple-array' })
  image: string[];

  @ManyToOne((type) => User, (user) => user.id, { cascade: ['soft-remove'] })
  @JoinColumn({ name: 'user_id' })
  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
