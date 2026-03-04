import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RestaurantResponseDto {
  @ApiProperty()
  restaurant_id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  address: string | null;

  @ApiPropertyOptional()
  res_lat: number | null;

  @ApiPropertyOptional()
  res_long: number | null;

  @ApiProperty()
  is_open: boolean;

  @ApiProperty()
  rating_average: number;
}
