import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { MenuItem } from './menu-item.entity';

@Entity('menu_groups')
export class MenuGroup {
  @PrimaryColumn({ length: 10 })
  group_id: string;

  @Column({ length: 10 })
  restaurant_id: string;

  @Column({ length: 255 })
  name: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuGroups)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @OneToMany(() => MenuItem, (item) => item.menuGroup)
  menuItems: MenuItem[];

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deleted_at: Date | null;
}
