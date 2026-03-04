import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus, { message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}` })
  @IsNotEmpty()
  status: OrderStatus;

  @ApiPropertyOptional({ description: 'Assign driver when status = PICKING_UP' })
  @IsOptional()
  @IsString()
  driver_id?: string;
}
