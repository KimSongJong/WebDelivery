import { IsNotEmpty , IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
    @ApiProperty({ example: 'refresh_token' , description: 'Refresh token nhận được khi đăng nhập'})
    @IsString()
    @IsNotEmpty({ message: 'Refresh token không được để trống'})
    refresh_token: string;
}
