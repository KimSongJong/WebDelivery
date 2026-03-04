import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MenuItem } from '../../entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async findByRestaurant(restaurantId: string): Promise<MenuItemResponseDto[]> {
    const items = await this.menuItemRepository.find({
      where: { restaurant_id: restaurantId },
    });
    return items.map((i) => this.toDto(i));
  }

  async findOne(id: string): Promise<MenuItemResponseDto> {
    const item = await this.menuItemRepository.findOne({
      where: { item_id: id },
    });
    if (!item) throw new NotFoundException(`Menu item ${id} not found`);
    return this.toDto(item);
  }

  async create(dto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    const item = this.menuItemRepository.create({
      item_id: uuidv4().replace(/-/g, '').substring(0, 10),
      is_available: dto.is_available ?? true,
      menu_group_id: dto.menu_group_id ?? null,
      ...dto,
    });
    const saved = await this.menuItemRepository.save(item);
    return this.toDto(saved);
  }

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItemResponseDto> {
    const item = await this.menuItemRepository.findOne({
      where: { item_id: id },
    });
    if (!item) throw new NotFoundException(`Menu item ${id} not found`);
    Object.assign(item, dto);
    const updated = await this.menuItemRepository.save(item);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.menuItemRepository.findOne({
      where: { item_id: id },
    });
    if (!item) throw new NotFoundException(`Menu item ${id} not found`);
    await this.menuItemRepository.remove(item);
    return { message: `Menu item ${id} deleted` };
  }

  private toDto(i: MenuItem): MenuItemResponseDto {
    return {
      item_id: i.item_id,
      restaurant_id: i.restaurant_id,
      menu_group_id: i.menu_group_id,
      name: i.name,
      description: i.description,
      image_url: i.image_url,
      price: Number(i.price),
      is_available: i.is_available,
    };
  }
}
