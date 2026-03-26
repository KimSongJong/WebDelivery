import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  MOMO = 'MOMO',
  ZALOPAY = 'ZALOPAY',
  VNPAY = 'VNPAY',
}

@Entity('payments')
export class Payment {
  @PrimaryColumn({ length: 10 })
  payment_id: string;

  @Column({ length: 10, unique: true })
  order_id: string;

  @Column({ length: 50 })
  payment_method: PaymentMethod;

  @Column({ length: 20, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'datetime', nullable: true })
  transaction_time: Date | null;

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
