import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../../../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({ example: 'PAY0000001', description: 'Mã thanh toán' })
  payment_id: string;

  @ApiProperty({ example: 'ORD0000001', description: 'Mã đơn hàng' })
  order_id: string;

  @ApiProperty({ enum: PaymentMethod, example: 'CASH', description: 'Phương thức thanh toán' })
  payment_method: string;

  @ApiProperty({ enum: PaymentStatus, example: 'PENDING', description: 'Trạng thái thanh toán' })
  payment_status: PaymentStatus;

  @ApiProperty({ example: 150000, description: 'Số tiền thanh toán (VND)' })
  amount: number;

  @ApiPropertyOptional({ example: '2026-03-26T14:30:00.000Z', description: 'Thời gian giao dịch' })
  transaction_time: Date | null;
}
