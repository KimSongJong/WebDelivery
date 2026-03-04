import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('restaurant_categories')
export class RestaurantCategory {
  @PrimaryColumn({ length: 10 })
  category_id: string;

  @Column({ length: 255 })
  name: string;

  @ManyToMany(() => Restaurant, (restaurant) => restaurant.categories)
  @JoinTable({
    name: 'restaurant_category_mapping',
    joinColumn: { name: 'category_id', referencedColumnName: 'category_id' },
    inverseJoinColumn: {
      name: 'restaurant_id',
      referencedColumnName: 'restaurant_id',
    },
  })
  restaurants: Restaurant[];
}
