import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from '../../entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async findAll(search?: string): Promise<RestaurantResponseDto[]> {
    const where = search ? { name: Like(`%${search}%`) } : {};
    const restaurants = await this.restaurantRepository.find({ where });
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
    const restaurant = this.restaurantRepository.create({
      restaurant_id: uuidv4().replace(/-/g, '').substring(0, 10),
      rating_average: 0,
      is_open: dto.is_open ?? true,
      ...dto,
    });
    const saved = await this.restaurantRepository.save(restaurant);
    return this.toDto(saved);
  }

  async update(
    id: string,
    dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { restaurant_id: id },
    });
    if (!restaurant) throw new NotFoundException(`Restaurant ${id} not found`);
    Object.assign(restaurant, dto);
    const updated = await this.restaurantRepository.save(restaurant);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { restaurant_id: id },
    });
    if (!restaurant) throw new NotFoundException(`Restaurant ${id} not found`);
    await this.restaurantRepository.remove(restaurant);
    return { message: `Restaurant ${id} deleted` };
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
    };
  }
}
