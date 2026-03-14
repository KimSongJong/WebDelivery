import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Or, Repository } from "typeorm";
import { User } from "../../entities/user.entity";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { Like } from "typeorm";
import { QueryUserDto } from "./dto/query-user.dto";
import { PaginatedUserDto } from "./dto/paginated-user.dto";
import { first, last } from "rxjs";
import { Order } from "@entities/order.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(query: QueryUserDto): Promise<PaginatedUserDto> {
    const { search, page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    const where = search
      ? [
          { name: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
          { phone_number: Like(`%${search}%`) },
        ]
      : {};

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
    });
    return {
      data: users.map((user) => this.toResponseDto(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return this.toResponseDto(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailTaken = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (emailTaken) throw new ConflictException("Email already in use");
    }

    Object.assign(user, updateUserDto);
    const updated = await this.userRepository.save(user);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    await this.userRepository.softRemove(user);
    return { message: `User ${id} deleted successfully` };
  }

  async deactivate(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    user.is_active = false;
    await this.userRepository.save(user);
    return { message: `User ${id} deactivated successfully` };
  }

  async activate(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    user.is_active = true;
    await this.userRepository.save(user);
    return { message: `User ${id} activated successfully` };
  }

  async getStatistics(userID: string) {
    const orders = await this.orderRepository.find({
      where: { user: { user_id: userID } },
    });

    return {
      total_orders: orders.length,
      total_spent: orders.reduce((sum, o) => sum + o.total_amount, 0),
      first_order_date: orders.length > 0 ? orders[0].created_at : null,
      last_order_date:
        orders.length > 0 ? orders[orders.length - 1].created_at : null,
    };
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      default_address: user.default_address,
      created_at: user.created_at,
    };
  }
}
