import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone_number: string | null;

  @ApiPropertyOptional()
  default_address: string | null;

  @ApiProperty()
  created_at: Date;
}
