import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhà hàng (có thể tìm kiếm)' })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('search') search?: string,
  ): Promise<RestaurantResponseDto[]> {
    return this.restaurantsService.findAll(search);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết nhà hàng' })
  findOne(@Param('id') id: string): Promise<RestaurantResponseDto> {
    return this.restaurantsService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Tạo nhà hàng mới' })
  create(@Body() dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    return this.restaurantsService.create(dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Cập nhật nhà hàng' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.update(id, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Xóa nhà hàng' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.restaurantsService.remove(id);
  }
}
