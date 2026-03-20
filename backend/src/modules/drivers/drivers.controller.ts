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
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverResponseDto } from './dto/driver-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';

@ApiTags('Drivers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Danh sách tài xế' })
  findAll(): Promise<DriverResponseDto[]> {
    return this.driversService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin tài xế' })
  findOne(@Param('id') id: string): Promise<DriverResponseDto> {
    return this.driversService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Tạo tài xế mới' })
  create(@Body() dto: CreateDriverDto): Promise<DriverResponseDto> {
    return this.driversService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin tài xế' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
    return this.driversService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Xóa tài xế' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.driversService.remove(id);
  }
}
