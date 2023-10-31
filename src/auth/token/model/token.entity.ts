import { User } from 'src/users/model/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  value: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;
}
