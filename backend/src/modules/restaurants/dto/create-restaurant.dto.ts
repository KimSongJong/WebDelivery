import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Bún bò Huế Cô Ba' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  res_lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  res_long?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_open?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ['cate001', 'cate002'],
    description: 'Danh sach category_id de gan voi nha hang',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  category_ids?: string[];
}
