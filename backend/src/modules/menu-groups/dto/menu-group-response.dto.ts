import { ApiProperty } from '@nestjs/swagger';

export class MenuGroupResponseDto {
  @ApiProperty()
  group_id: string;

  @ApiProperty()
  restaurant_id: string;

  @ApiProperty()
  name: string;
}
