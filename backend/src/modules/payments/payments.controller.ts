import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo thanh toán cho đơn hàng' })
  create(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.paymentsService.create(dto);
  }

  @Get('by-order/:orderId')
  @ApiOperation({ summary: 'Lấy thông tin thanh toán theo đơn hàng' })
  findByOrder(@Param('orderId') orderId: string): Promise<PaymentResponseDto> {
    return this.paymentsService.findByOrder(orderId);
  }

  @Patch(':id/confirm')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Xác nhận thanh toán thành công' })
  confirm(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.confirmPayment(id);
  }
}
