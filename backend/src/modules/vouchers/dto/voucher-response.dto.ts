import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../../entities/voucher.entity';

export class VoucherResponseDto {
  @ApiProperty()
  voucher_id: string;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: DiscountType })
  discount_type: DiscountType | null;

  @ApiProperty()
  discount_value: number;

  @ApiPropertyOptional()
  max_discount_amount: number | null;

  @ApiProperty()
  min_order_value: number;

  @ApiPropertyOptional()
  start_date: Date | null;

  @ApiPropertyOptional()
  end_date: Date | null;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;
}
