import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { MenuGroup } from './menu-group.entity';
import { MenuItem } from './menu-item.entity';
import { Order } from './order.entity';
import { RestaurantCategory } from './restaurant-category.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryColumn({ length: 10 })
  restaurant_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'float', nullable: true })
  res_lat: number | null;

  @Column({ type: 'float', nullable: true })
  res_long: number | null;

  @Column({ type: 'tinyint', default: 1 })
  is_open: boolean;

  @Column({ type: 'float', default: 0 })
  rating_average: number;

  @OneToMany(() => MenuGroup, (group) => group.restaurant)
  menuGroups: MenuGroup[];

  @OneToMany(() => MenuItem, (item) => item.restaurant)
  menuItems: MenuItem[];

  @OneToMany(() => Order, (order) => order.restaurant)
  orders: Order[];

  @ManyToMany(() => RestaurantCategory, (cat) => cat.restaurants)
  categories: RestaurantCategory[];
}
