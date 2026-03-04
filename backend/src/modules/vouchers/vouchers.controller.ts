import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { VoucherResponseDto } from './dto/voucher-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Vouchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: '[Admin] Danh sách tất cả voucher' })
  findAll(): Promise<VoucherResponseDto[]> {
    return this.vouchersService.findAll();
  }

  @Public()
  @Get('check')
  @ApiOperation({ summary: 'Kiểm tra mã voucher theo code' })
  @ApiQuery({ name: 'code', required: true })
  findByCode(@Query('code') code: string): Promise<VoucherResponseDto> {
    return this.vouchersService.findByCode(code);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Tạo voucher mới' })
  create(@Body() dto: CreateVoucherDto): Promise<VoucherResponseDto> {
    return this.vouchersService.create(dto);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Vô hiệu hóa voucher' })
  deactivate(@Param('id') id: string): Promise<VoucherResponseDto> {
    return this.vouchersService.deactivate(id);
  }
}
