import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from './menu-item.entity';

@Entity('order_details')
export class OrderDetail {
  @PrimaryColumn({ length: 10 })
  id: string;

  @Column({ length: 10 })
  order_id: string;

  @Column({ length: 10 })
  item_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_at_order: number;

  @ManyToOne(() => Order, (order) => order.orderDetails)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => MenuItem, (item) => item.orderDetails)
  @JoinColumn({ name: 'item_id' })
  menuItem: MenuItem;
}
