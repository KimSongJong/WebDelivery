import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'ORD0000001', description: 'Mã đơn hàng cần thanh toán' })
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
    description: 'Phương thức thanh toán',
  })
  @IsEnum(PaymentMethod, {
    message: `payment_method must be one of: ${Object.values(PaymentMethod).join(', ')}`,
  })
  payment_method: PaymentMethod;
}
