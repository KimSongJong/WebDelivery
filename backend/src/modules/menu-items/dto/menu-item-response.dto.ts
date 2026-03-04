import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenuItemResponseDto {
  @ApiProperty()
  item_id: string;

  @ApiProperty()
  restaurant_id: string;

  @ApiPropertyOptional()
  menu_group_id: string | null;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  image_url: string | null;

  @ApiProperty()
  price: number;

  @ApiProperty()
  is_available: boolean;
}
