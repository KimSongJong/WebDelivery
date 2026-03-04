import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { MenuGroup } from './menu-group.entity';
import { OrderDetail } from './order-detail.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryColumn({ length: 10 })
  item_id: string;

  @Column({ length: 10 })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  menu_group_id: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'tinyint', default: 1 })
  is_available: boolean;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => MenuGroup, (group) => group.menuItems, { nullable: true })
  @JoinColumn({ name: 'menu_group_id' })
  menuGroup: MenuGroup | null;

  @OneToMany(() => OrderDetail, (detail) => detail.menuItem)
  orderDetails: OrderDetail[];
}
