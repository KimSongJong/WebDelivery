import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverResponseDto {
  @ApiProperty()
  driver_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone_number: string;

  @ApiPropertyOptional()
  vehicle_info: string | null;

  @ApiPropertyOptional()
  current_lat: number | null;

  @ApiPropertyOptional()
  current_long: number | null;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;
}
