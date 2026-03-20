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
import { MenuGroupsService } from './menu-groups.service';
import { CreateMenuGroupDto } from './dto/create-menu-group.dto';
import { UpdateMenuGroupDto } from './dto/update-menu-group.dto';
import { MenuGroupResponseDto } from './dto/menu-group-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Menu Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu-groups')
export class MenuGroupsController {
  constructor(private readonly menuGroupsService: MenuGroupsService) {}

  @Public()
  @Get('by-restaurant/:restaurantId')
  @ApiOperation({ summary: 'Lấy danh mục menu theo nhà hàng' })
  findByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<MenuGroupResponseDto[]> {
    return this.menuGroupsService.findByRestaurant(restaurantId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết nhóm menu' })
  findOne(@Param('id') id: string): Promise<MenuGroupResponseDto> {
    return this.menuGroupsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo nhóm menu mới' })
  create(
    @Body() dto: CreateMenuGroupDto,
  ): Promise<MenuGroupResponseDto> {
    return this.menuGroupsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Đổi tên nhóm menu' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuGroupDto,
  ): Promise<MenuGroupResponseDto> {
    return this.menuGroupsService.update(id, dto.name);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Xóa nhóm menu' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.menuGroupsService.remove(id);
  }
}
