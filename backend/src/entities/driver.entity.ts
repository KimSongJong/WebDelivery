import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('drivers')
export class Driver {
  @PrimaryColumn({ length: 10 })
  driver_id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 20 })
  phone_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  vehicle_info: string | null;

  @Column({ type: 'float', nullable: true })
  current_lat: number | null;

  @Column({ type: 'float', nullable: true })
  current_long: number | null;

  @Column({ type: 'tinyint', default: 1 })
  is_active: boolean;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @OneToMany(() => Order, (order) => order.driver)
  orders: Order[];
}
