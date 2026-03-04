import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Menu Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Public()
  @Get('by-restaurant/:restaurantId')
  @ApiOperation({ summary: 'Lấy danh sách món ăn theo nhà hàng' })
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<MenuItemResponseDto[]> {
    return this.menuItemsService.findByRestaurant(restaurantId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết món ăn' })
  findOne(@Param('id') id: string): Promise<MenuItemResponseDto> {
    return this.menuItemsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Thêm món ăn mới' })
  create(@Body() dto: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    return this.menuItemsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Cập nhật món ăn' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    return this.menuItemsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Xóa món ăn' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.menuItemsService.remove(id);
  }
}
