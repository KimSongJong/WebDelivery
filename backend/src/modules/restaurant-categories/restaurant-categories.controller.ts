import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Role, Roles } from '../../common/decorators/roles.decorator';
import { CreateRestaurantCategoryDto } from './dto/create-restaurant-category.dto';
import { UpdateRestaurantCategoryDto } from './dto/update-restaurant-category.dto';
import { RestaurantCategoryResponseDto } from './dto/restaurant-category-response.dto';
import { RestaurantCategoriesService } from './restaurant-categories.service';

@ApiTags('Restaurant Categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurant-categories')
export class RestaurantCategoriesController {
	constructor(
		private readonly restaurantCategoriesService: RestaurantCategoriesService,
	) {}

	@Public()
	@Get()
	@ApiOperation({ summary: 'Lấy danh sách loại nhà hàng' })
	findAll(): Promise<RestaurantCategoryResponseDto[]> {
		return this.restaurantCategoriesService.findAll();
	}

	@Public()
	@Get(':id')
	@ApiOperation({ summary: 'Lấy chi tiết loại nhà hàng' })
	findOne(@Param('id') id: string): Promise<RestaurantCategoryResponseDto> {
		return this.restaurantCategoriesService.findOne(id);
	}

	@ApiBearerAuth()
	@Post()
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: '[Admin] Tạo loại nhà hàng mới' })
	create(
		@Body() dto: CreateRestaurantCategoryDto,
	): Promise<RestaurantCategoryResponseDto> {
		return this.restaurantCategoriesService.create(dto);
	}

	@ApiBearerAuth()
	@Patch(':id')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: '[Admin] Cập nhật loại nhà hàng' })
	update(
		@Param('id') id: string,
		@Body() dto: UpdateRestaurantCategoryDto,
	): Promise<RestaurantCategoryResponseDto> {
		return this.restaurantCategoriesService.update(id, dto);
	}

	@ApiBearerAuth()
	@Delete(':id')
	@Roles(Role.ADMIN)
	@ApiOperation({ summary: '[Admin] Xóa loại nhà hàng' })
	remove(@Param('id') id: string): Promise<{ message: string }> {
		return this.restaurantCategoriesService.remove(id);
	}
}
