import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from '../../entities/restaurant.entity';
import { RestaurantCategory } from '../../entities/restaurant-category.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { MenuGroup } from '../../entities/menu-group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      RestaurantCategory,
      MenuItem,
      MenuGroup,
    ]),
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
