import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Delete,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { VouchersService } from "./vouchers.service";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { VoucherResponseDto } from "./dto/voucher-response.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Role } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { UpdateVoucherDto } from "./dto/update_voucher.dto";
import { VoucherStatisticsDto } from "./dto/voucher-statistics.dto";

@ApiTags("Vouchers")
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("vouchers")
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: "[Admin] Danh sách tất cả voucher" })
  findAll(@Query("search") search: string): Promise<VoucherResponseDto[]> {
    return this.vouchersService.findAll(search);
  }

  @Public()
  @Get("check")
  @ApiOperation({ summary: "Kiểm tra mã voucher theo code" })
  @ApiQuery({ name: "code", required: true })
  findByCode(@Query("code") code: string): Promise<VoucherResponseDto> {
    return this.vouchersService.findByCode(code);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "[Admin] Tạo voucher mới" })
  create(@Body() dto: CreateVoucherDto): Promise<VoucherResponseDto> {
    return this.vouchersService.create(dto);
  }

  @Patch(":id/deactivate")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "[Admin] Vô hiệu hóa voucher" })
  deactivate(@Param("id") id: string): Promise<VoucherResponseDto> {
    return this.vouchersService.deactivate(id);
  }

  @Patch(":id/activate")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "[Admin] Kích hoạt voucher" })
  activate(@Param("id") id: string): Promise<VoucherResponseDto> {
    return this.vouchersService.activate(id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "[Admin] Cập nhật thông tin voucher" })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateVoucherDto,
  ): Promise<VoucherResponseDto> {
    return this.vouchersService.update(id, dto);
  }

  @Get(":id/statistics")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "[Admin] Thống kê sử dụng voucher" })
  async statistics(@Param("id") id: string): Promise<VoucherStatisticsDto> {
    const stats = await this.vouchersService.getStatistics(id);
    return {
      ...stats,
      first_used_date: stats.first_used_date
        ? stats.first_used_date.toISOString()
        : null,
      last_used_date: stats.last_used_date
        ? stats.last_used_date.toISOString()
        : null,
    };
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "[Admin] Xóa voucher" })
  remove(@Param("id") id: string): Promise<{ message: string }> {
    return this.vouchersService.remove(id);
  }
}
