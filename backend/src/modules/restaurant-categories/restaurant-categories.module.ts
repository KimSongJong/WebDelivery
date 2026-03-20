import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantCategory } from '../../entities/restaurant-category.entity';
import { Restaurant } from '../../entities/restaurant.entity';
import { RestaurantCategoriesController } from './restaurant-categories.controller';
import { RestaurantCategoriesService } from './restaurant-categories.service';

@Module({
	imports: [TypeOrmModule.forFeature([RestaurantCategory, Restaurant])],
	controllers: [RestaurantCategoriesController],
	providers: [RestaurantCategoriesService],
	exports: [RestaurantCategoriesService],
})
export class RestaurantCategoriesModule {}
