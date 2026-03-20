import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from '../../entities/restaurant.entity';
import { RestaurantCategory } from '../../entities/restaurant-category.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { MenuGroup } from '../../entities/menu-group.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(RestaurantCategory)
    private readonly categoryRepository: Repository<RestaurantCategory>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuGroup)
    private readonly menuGroupRepository: Repository<MenuGroup>,
  ) {}

  async findAll(
    search?: string,
    categoryId?: string,
  ): Promise<RestaurantResponseDto[]> {
    const qb = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.categories', 'category');

    if (search) {
      qb.andWhere('restaurant.name LIKE :search', { search: `%${search}%` });
    }

    if (categoryId) {
      qb.innerJoin(
        'restaurant.categories',
        'filterCategory',
        'filterCategory.category_id = :categoryId',
        { categoryId },
      );
    }

    const restaurants = await qb.getMany();
    return restaurants.map((r) => this.toDto(r));
  }

  async findOne(id: string): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { restaurant_id: id },
      relations: ['menuGroups', 'categories'],
    });
    if (!restaurant) throw new NotFoundException(`Restaurant ${id} not found`);
    return this.toDto(restaurant);
  }

  async create(dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    const { category_ids, ...payload } = dto;
    const restaurant = this.restaurantRepository.create({
      restaurant_id: uuidv4().replace(/-/g, '').substring(0, 10),
      is_open: payload.is_open ?? true,
      ...payload,
    });

    const saved = await this.restaurantRepository.save(restaurant);

    if (category_ids !== undefined) {
      await this.validateCategoryIds(category_ids);
      await this.syncRestaurantCategories(saved.restaurant_id, category_ids);
    }

    return this.findOne(saved.restaurant_id);
  }

  async update(
    id: string,
    dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    const { category_ids, ...payload } = dto;
    const restaurant = await this.restaurantRepository.findOne({
      where: { restaurant_id: id },
    });
    if (!restaurant) throw new NotFoundException(`Restaurant ${id} not found`);

    Object.assign(restaurant, payload);

    const updated = await this.restaurantRepository.save(restaurant);

    if (category_ids !== undefined) {
      await this.validateCategoryIds(category_ids);
      await this.syncRestaurantCategories(updated.restaurant_id, category_ids);
    }

    return this.findOne(updated.restaurant_id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { restaurant_id: id },
    });
    if (!restaurant) throw new NotFoundException(`Restaurant ${id} not found`);

    await this.restaurantRepository.manager.transaction(async () => {
      await this.menuItemRepository
        .createQueryBuilder()
        .softDelete()
        .where('restaurant_id = :restaurantId', { restaurantId: id })
        .execute();

      await this.menuGroupRepository
        .createQueryBuilder()
        .softDelete()
        .where('restaurant_id = :restaurantId', { restaurantId: id })
        .execute();

      await this.restaurantRepository.softDelete({ restaurant_id: id });
    });

    return { message: `Restaurant ${id} soft deleted` };

  }

  private toDto(r: Restaurant): RestaurantResponseDto {
    return {
      restaurant_id: r.restaurant_id,
      name: r.name,
      description: r.description,
      address: r.address,
      res_lat: r.res_lat,
      res_long: r.res_long,
      is_open: r.is_open,
      rating_average: r.rating_average,
      categories: r.categories?.map((category) => ({
        category_id: category.category_id,
        name: category.name,
      })),
    };
  }

  private async validateCategoryIds(categoryIds: string[]): Promise<void> {
    if (!categoryIds.length) return;

    const categories = await this.categoryRepository.find({
      where: { category_id: In(categoryIds) },
      select: ['category_id'],
    });

    const foundIds = new Set(categories.map((category) => category.category_id));
    const missingIds = categoryIds.filter((id) => !foundIds.has(id));

    if (missingIds.length) {
      throw new NotFoundException(
        `Category not found: ${missingIds.join(', ')}`,
      );
    }
  }

  private async syncRestaurantCategories(
    restaurantId: string,
    nextCategoryIds: string[],
  ): Promise<void> {
    const currentCategories = await this.categoryRepository
      .createQueryBuilder('category')
      .innerJoin('category.restaurants', 'restaurant')
      .where('restaurant.restaurant_id = :restaurantId', { restaurantId })
      .select('category.category_id', 'category_id')
      .getRawMany<{ category_id: string }>();

    const currentIds = currentCategories.map((item) => item.category_id);
    const nextIdsSet = new Set(nextCategoryIds);

    const toRemove = currentIds.filter((id) => !nextIdsSet.has(id));
    const toAdd = nextCategoryIds.filter((id) => !currentIds.includes(id));

    if (toRemove.length) {
      await Promise.all(
        toRemove.map((categoryId) =>
          this.categoryRepository
            .createQueryBuilder()
            .relation(RestaurantCategory, 'restaurants')
            .of(categoryId)
            .remove(restaurantId),
        ),
      );
    }

    if (toAdd.length) {
      await Promise.all(
        toAdd.map((categoryId) =>
          this.categoryRepository
            .createQueryBuilder()
            .relation(RestaurantCategory, 'restaurants')
            .of(categoryId)
            .add(restaurantId),
        ),
      );
    }
  }
}
