import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ length: 10 })
  user_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number: string | null;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'text', nullable: true })
  default_address: string | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
