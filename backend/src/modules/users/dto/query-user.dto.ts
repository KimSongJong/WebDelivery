import {IsInt , Min , IsOptional , IsString} from 'class-validator';
import { Type }  from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUserDto {

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Nguyen Van A', description: 'Từ khóa tìm kiếm theo tên hoặc email' })
    search?: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    @ApiPropertyOptional({ example: 1, description: 'Số trang (mặc định: 1)' })
    page?: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    @ApiPropertyOptional({ example: 10, description: 'Số lượng bản ghi trên mỗi trang (mặc định: 10)' })
    limit?: number = 10;
}