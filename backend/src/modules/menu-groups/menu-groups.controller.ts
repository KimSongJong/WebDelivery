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
import { MenuGroupResponseDto } from './dto/menu-group-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateMenuGroupNameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

@ApiTags('Menu Groups')
@ApiBearerAuth('JWT-auth')
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
    @Body() dto: UpdateMenuGroupNameDto,
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
