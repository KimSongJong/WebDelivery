import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MenuItem } from '../../entities/menu-item.entity';
import { Restaurant } from '../../entities/restaurant.entity';
import { MenuGroup } from '../../entities/menu-group.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuGroup)
    private readonly menuGroupRepository: Repository<MenuGroup>,
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
    await this.validateRestaurant(dto.restaurant_id);
    await this.validateMenuGroup(dto.restaurant_id, dto.menu_group_id);

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

    const restaurantId = dto.restaurant_id ?? item.restaurant_id;
    const menuGroupId =
      dto.menu_group_id !== undefined ? dto.menu_group_id : item.menu_group_id;

    await this.validateRestaurant(restaurantId);
    await this.validateMenuGroup(restaurantId, menuGroupId);

    Object.assign(item, dto);
    const updated = await this.menuItemRepository.save(item);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.menuItemRepository.findOne({
      where: { item_id: id },
    });
    if (!item) throw new NotFoundException(`Menu item ${id} not found`);
    await this.menuItemRepository.softDelete({ item_id: id });
    return { message: `Menu item ${id} soft deleted` };
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

  private async validateRestaurant(restaurantId: string): Promise<void> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { restaurant_id: restaurantId },
    });
    if (!restaurant) {
      throw new BadRequestException(`Restaurant ${restaurantId} does not exist`);
    }
  }

  private async validateMenuGroup(
    restaurantId: string,
    menuGroupId?: string | null,
  ): Promise<void> {
    if (!menuGroupId) return;

    const menuGroup = await this.menuGroupRepository.findOne({
      where: { group_id: menuGroupId },
    });
    if (!menuGroup) {
      throw new BadRequestException(`Menu group ${menuGroupId} does not exist`);
    }

    if (menuGroup.restaurant_id !== restaurantId) {
      throw new BadRequestException(
        `Menu group ${menuGroupId} does not belong to restaurant ${restaurantId}`,
      );
    }
  }
}
