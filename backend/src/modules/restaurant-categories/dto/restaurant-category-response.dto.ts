import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CategoryRestaurantDto {
	@ApiProperty()
	restaurant_id: string;

	@ApiProperty()
	name: string;
}

export class RestaurantCategoryResponseDto {
	@ApiProperty()
	category_id: string;

	@ApiProperty()
	name: string;

	@ApiPropertyOptional({ type: [CategoryRestaurantDto] })
	restaurants?: CategoryRestaurantDto[];
}
