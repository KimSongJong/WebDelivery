import {
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsNumber,
  IsBoolean,
} from "class-validator";

export class UpdateVoucherDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(["FIXED", "PERCENTAGE"])
  discount_type?: string;

  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @IsOptional()
  @IsNumber()
  max_discount_amount?: number;

  @IsOptional()
  @IsNumber()
  min_order_value?: number;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
