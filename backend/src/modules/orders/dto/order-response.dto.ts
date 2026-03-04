import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../entities/order.entity';

export class OrderDetailItemDto {
  @ApiProperty()
  item_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price_at_order: number;
}

export class OrderResponseDto {
  @ApiProperty()
  order_id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  restaurant_id: string;

  @ApiPropertyOptional()
  driver_id: string | null;

  @ApiPropertyOptional()
  voucher_id: string | null;

  @ApiProperty()
  total_amount: number;

  @ApiProperty()
  discount_amount: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  created_at: Date;

  @ApiPropertyOptional()
  delivered_at: Date | null;

  @ApiProperty({ type: [OrderDetailItemDto] })
  items: OrderDetailItemDto[];
}
