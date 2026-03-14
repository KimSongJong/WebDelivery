import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { User, UserRole, RolePrefixMap } from "../../entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    const role = registerDto.role ?? UserRole.CUSTOMER;
    const userId = await this.generateUserId(role);

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(registerDto.password, saltRounds);

    const user = this.userRepository.create({
      user_id: userId,
      role,
      name: registerDto.name,
      email: registerDto.email,
      password_hash,
      phone_number: registerDto.phone_number ?? null,
      default_address: registerDto.default_address ?? null,
    });

    const savedUser = await this.userRepository.save(user);
    const token = this.generateTokens(savedUser);

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      user_id: savedUser.user_id,
      email: savedUser.email,
      name: savedUser.name,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.is_active) {
      throw new UnauthorizedException(
        "Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ quản trị viên",
      );
    }

    const token = this.generateTokens(user);

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      user_id: user.user_id,
      email: user.email,
      name: user.name,
    };
  }
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Tìm người dùng theo userId
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    // Nếu không tìm thấy người dùng, trả về lỗi
    if (!user) {
      throw new UnauthorizedException("Người dùng không tồn tại");
    }
    // kiểm tra mật khâu hiện tại có đúng không
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.current_password,
      user.password_hash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Mật khẩu hiện tại không đúng");
    }
    // Mã hóa mật khẩu mới
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(dto.new_password, saltRounds);
    // Cập nhật mật khẩu mới cho người dùng
    user.password_hash = newPasswordHash;
    await this.userRepository.save(user);
    // Trả về thông báo thành công
    return { message: "Đổi mật khẩu thành công" };
  }

  async refreshToken(
    dto: RefreshTokenDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(dto.refresh_token); // Xác minh refresh token có hợp lệ hay ko
      const user = await this.userRepository.findOne({
        where: { user_id: payload.sub },
      }); // Tìm người dùng theo user_id trong payload
      if (!user) {
        throw new UnauthorizedException("Người dùng không tồn tại");
      }
      // tạo token mới
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException(
        "Refresh token không hợp lệ hoặc đã hết hạn",
      );
    }
  }
  private async generateUserId(role: UserRole): Promise<string> {
    const prefix = RolePrefixMap[role];

    const lastUser = await this.userRepository
      .createQueryBuilder("user")
      .where("user.user_id LIKE :prefix", { prefix: `${prefix}%` })
      .orderBy("user.user_id", "DESC")
      .getOne();

    let nextNumber = 1;
    if (lastUser) {
      const currentNumber = parseInt(
        lastUser.user_id.substring(prefix.length),
        10,
      );
      nextNumber = currentNumber + 1;
    }

    const padLength = 10 - prefix.length;
    return `${prefix}${nextNumber.toString().padStart(padLength, "0")}`;
  }
  private generateTokens(user: User): {
    access_token: string;
    refresh_token: string;
  } {
    const payload: JwtPayload = {
      sub: user.user_id,
      email: user.email,
      role: user.role,
    };
    // Access token: hết hạn sau 15 phút
    const access_token = this.jwtService.sign(payload, { expiresIn: "15m" });
    // Refresh token: hết hạn sau 7 ngày
    const refresh_token = this.jwtService.sign(payload, { expiresIn: "7d" });
    // Trả về cả access token và refresh token
    return { access_token, refresh_token };
  }
}
