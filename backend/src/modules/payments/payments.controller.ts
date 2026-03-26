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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo thanh toán cho đơn hàng (chỉ chủ đơn hàng)' })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.create(dto, user.user_id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả thanh toán' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.paymentsService.findAll(parseInt(page), parseInt(limit));
  }

  @Get('my-payments')
  @ApiOperation({ summary: 'Xem lịch sử thanh toán của tôi' })
  getMyPayments(@CurrentUser() user: User): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findAllByUser(user.user_id);
  }

  @Get('by-order/:orderId')
  @ApiOperation({ summary: 'Lấy thông tin thanh toán theo đơn hàng' })
  findByOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: User,
  ): Promise<PaymentResponseDto> {
    // Admin sẽ bypass ownership check (userId = undefined)
    const isAdmin = user.role === 'admin';
    return this.paymentsService.findByOrder(
      orderId,
      isAdmin ? undefined : user.user_id,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết thanh toán theo ID' })
  findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/confirm')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Xác nhận thanh toán thành công (→ Order CONFIRMED)' })
  confirm(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.confirmPayment(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Hủy thanh toán (chỉ PENDING, chỉ chủ đơn hàng)' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.cancelPayment(id, user.user_id);
  }

  @Patch(':id/refund')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Hoàn tiền thanh toán (chỉ COMPLETED → REFUNDED)' })
  refund(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.refundPayment(id);
  }
}
