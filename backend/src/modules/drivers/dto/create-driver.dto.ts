import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[0-9]{10,11}$/, { message: 'Invalid phone number' })
  phone_number: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vehicle_info?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  current_lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  current_long?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
