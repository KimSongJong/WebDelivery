import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty} from "@nestjs/swagger";

export class ChangePasswordDto {
    @ApiProperty({ example: '123456' , description: 'Mật khẩu hiện tại'})
    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu hiện tại không được để trống'})
    current_password: string;

    @ApiProperty({ example: 'newpassword123' , description: 'Mật khẩu mới'})
    @IsString()
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống'})
    @MinLength(6 , {message: 'Mật khẩu mới phải có ít nhất 6 ký tự trở lên'})
    new_password: string;
}