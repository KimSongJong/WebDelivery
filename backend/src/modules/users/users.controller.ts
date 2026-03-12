import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { PaginatedUserDto } from './dto/paginated-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Query } from '@nestjs/common';


@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Lấy danh sách tất cả người dùng' })
  @ApiResponse({ status: 200, type: PaginatedUserDto })
  findAll(@Query() query: QueryUserDto): Promise<PaginatedUserDto> {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của người dùng hiện tại' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  getMe(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.usersService.findOne(user.user_id);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Lấy thông tin người dùng theo ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(user.user_id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Xóa người dùng' })
  deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.usersService.remove(id);
  }
}
