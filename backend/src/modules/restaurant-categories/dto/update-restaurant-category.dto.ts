import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantCategoryDto } from './create-restaurant-category.dto';

export class UpdateRestaurantCategoryDto extends PartialType(
	CreateRestaurantCategoryDto,
) {}
