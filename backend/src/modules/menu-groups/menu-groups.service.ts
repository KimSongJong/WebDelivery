import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MenuGroup } from '../../entities/menu-group.entity';
import { Restaurant } from '../../entities/restaurant.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { CreateMenuGroupDto } from './dto/create-menu-group.dto';
import { MenuGroupResponseDto } from './dto/menu-group-response.dto';

@Injectable()
export class MenuGroupsService {
  constructor(
    @InjectRepository(MenuGroup)
    private readonly menuGroupRepository: Repository<MenuGroup>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async findByRestaurant(restaurantId: string): Promise<MenuGroupResponseDto[]> {
    const groups = await this.menuGroupRepository.find({
      where: { restaurant_id: restaurantId },
    });
    return groups.map((g) => this.toDto(g));
  }

  async findOne(id: string): Promise<MenuGroupResponseDto> {
    const group = await this.menuGroupRepository.findOne({
      where: { group_id: id },
    });
    if (!group) throw new NotFoundException(`Menu group ${id} not found`);
    return this.toDto(group);
  }

  async create(dto: CreateMenuGroupDto): Promise<MenuGroupResponseDto> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { restaurant_id: dto.restaurant_id },
    });
    if (!restaurant) {
      throw new BadRequestException(
        `Restaurant ${dto.restaurant_id} does not exist`,
      );
    }

    const group = this.menuGroupRepository.create({
      group_id: uuidv4().replace(/-/g, '').substring(0, 10),
      ...dto,
    });
    const saved = await this.menuGroupRepository.save(group);
    return this.toDto(saved);
  }

  async update(id: string, name: string): Promise<MenuGroupResponseDto> {
    const group = await this.menuGroupRepository.findOne({
      where: { group_id: id },
    });
    if (!group) throw new NotFoundException(`Menu group ${id} not found`);
    group.name = name;
    const updated = await this.menuGroupRepository.save(group);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const group = await this.menuGroupRepository.findOne({
      where: { group_id: id },
    });
    if (!group) throw new NotFoundException(`Menu group ${id} not found`);

    await this.menuItemRepository
      .createQueryBuilder()
      .softDelete()
      .where('menu_group_id = :groupId', { groupId: id })
      .execute();

    await this.menuGroupRepository.softDelete({ group_id: id });
    return { message: `Menu group ${id} soft deleted` };
  }

  private toDto(g: MenuGroup): MenuGroupResponseDto {
    return { group_id: g.group_id, restaurant_id: g.restaurant_id, name: g.name };
  }
}
