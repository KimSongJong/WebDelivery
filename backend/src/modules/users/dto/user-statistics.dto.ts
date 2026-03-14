import { IsNumber, IsOptional, IsDateString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserStatisticsDto {
  @ApiProperty()
  @IsNumber()
  total_orders?: number;

  @ApiProperty()
  @IsNumber()
  total_spent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  first_order_date?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  last_order_date?: string | null;
}
