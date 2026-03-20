import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RestaurantCategory } from '../../entities/restaurant-category.entity';
import { CreateRestaurantCategoryDto } from './dto/create-restaurant-category.dto';
import { UpdateRestaurantCategoryDto } from './dto/update-restaurant-category.dto';
import { RestaurantCategoryResponseDto } from './dto/restaurant-category-response.dto';

@Injectable()
export class RestaurantCategoriesService {
	constructor(
		@InjectRepository(RestaurantCategory)
		private readonly categoryRepository: Repository<RestaurantCategory>,
	) {}

	async findAll(): Promise<RestaurantCategoryResponseDto[]> {
		const categories = await this.categoryRepository.find();
		return categories.map((category) => this.toDto(category));
	}

	async findOne(id: string): Promise<RestaurantCategoryResponseDto> {
		const category = await this.categoryRepository.findOne({
			where: { category_id: id },
			relations: ['restaurants'],
		});
		if (!category) throw new NotFoundException(`Category ${id} not found`);
		return this.toDto(category, true);
	}

	async create(
		dto: CreateRestaurantCategoryDto,
	): Promise<RestaurantCategoryResponseDto> {
		const category = this.categoryRepository.create({
			category_id: uuidv4().replace(/-/g, '').substring(0, 10),
			...dto,
		});
		const saved = await this.categoryRepository.save(category);
		return this.toDto(saved);
	}

	async update(
		id: string,
		dto: UpdateRestaurantCategoryDto,
	): Promise<RestaurantCategoryResponseDto> {
		const category = await this.categoryRepository.findOne({
			where: { category_id: id },
		});
		if (!category) throw new NotFoundException(`Category ${id} not found`);

		Object.assign(category, dto);
		const updated = await this.categoryRepository.save(category);
		return this.toDto(updated);
	}

	async remove(id: string): Promise<{ message: string }> {
		const category = await this.categoryRepository.findOne({
			where: { category_id: id },
		});
		if (!category) throw new NotFoundException(`Category ${id} not found`);

		await this.categoryRepository
			.createQueryBuilder()
			.relation(RestaurantCategory, 'restaurants')
			.of(id)
			.set([]);

		await this.categoryRepository.remove(category);
		return { message: `Category ${id} deleted` };
	}

	private toDto(
		category: RestaurantCategory,
		includeRestaurants = false,
	): RestaurantCategoryResponseDto {
		return {
			category_id: category.category_id,
			name: category.name,
			restaurants: includeRestaurants
				? category.restaurants?.map((restaurant) => ({
						restaurant_id: restaurant.restaurant_id,
						name: restaurant.name,
					}))
				: undefined,
		};
	}
}
