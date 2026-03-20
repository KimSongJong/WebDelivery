import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRestaurantCategoryDto {
	@ApiProperty({ example: 'Com Viet' })
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	name: string;
}
