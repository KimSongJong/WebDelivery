import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsNumber } from "class-validator";

export class VoucherStatisticsDto {
  @ApiProperty()
  @IsNumber()
  total_used: number;

  @ApiProperty()
  @IsNumber()
  total_discount: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  first_used_date: string | null;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  last_used_date: string | null;
}
