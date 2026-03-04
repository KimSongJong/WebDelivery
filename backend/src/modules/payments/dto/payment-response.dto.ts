import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../../../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty()
  payment_id: string;

  @ApiProperty()
  order_id: string;

  @ApiProperty()
  payment_method: string;

  @ApiProperty({ enum: PaymentStatus })
  payment_status: PaymentStatus;

  @ApiProperty()
  amount: number;

  @ApiPropertyOptional()
  transaction_time: Date | null;
}
