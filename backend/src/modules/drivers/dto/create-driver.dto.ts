import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsLatitude,
  IsLongitude,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateDriverDto {
  @ApiProperty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, '') : value,
  )
  @IsString()
  @IsNotEmpty()
  @Matches(/^0\d{9,10}$/, { message: 'Phone number must start with 0 and contain 10-11 digits' })
  phone_number: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(255)
  vehicle_info?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLatitude({ message: 'current_lat must be a valid latitude between -90 and 90' })
  current_lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsLongitude({ message: 'current_long must be a valid longitude between -180 and 180' })
  current_long?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
