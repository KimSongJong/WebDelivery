import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Order, OrderStatus } from "../../entities/order.entity";
import { OrderDetail } from "../../entities/order-detail.entity";
import { MenuItem } from "../../entities/menu-item.entity";
import { Voucher, DiscountType } from "../../entities/voucher.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderResponseDto, OrderDetailItemDto } from "./dto/order-response.dto";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    // Pre-validate voucher BEFORE transaction to avoid lock timeout
    let voucherPreCheck: Voucher | null = null;
    if (dto.voucher_id) {
      voucherPreCheck = await this.voucherRepository.findOne({
        where: { voucher_id: dto.voucher_id, is_active: true },
      });
      if (!voucherPreCheck) {
        throw new BadRequestException("Voucher not found or inactive");
      }
    }

    return this.dataSource.transaction(async (manager) => {
      // Validate and load items
      const itemIds = dto.items.map((i) => i.item_id);
      const menuItems = await manager.findByIds(MenuItem, itemIds);

      if (menuItems.length !== itemIds.length) {
        throw new BadRequestException("One or more menu items not found");
      }

      const unavailable = menuItems.filter((m) => !m.is_available);
      if (unavailable.length > 0) {
        throw new BadRequestException(
          `Items not available: ${unavailable.map((m) => m.name).join(", ")}`,
        );
      }

      // Calculate total
      let totalAmount = 0;
      const itemMap = new Map(menuItems.map((m) => [m.item_id, m]));

      for (const orderItem of dto.items) {
        const menuItem = itemMap.get(orderItem.item_id)!;
        totalAmount += Number(menuItem.price) * orderItem.quantity;
      }

      // Apply voucher (use pre-checked voucher)
      let discountAmount = 0;
      let voucher: Voucher | null = voucherPreCheck;

      if (voucher) {
        const now = new Date();
        if (
          (voucher.start_date && now < voucher.start_date) ||
          (voucher.end_date && now > voucher.end_date)
        ) {
          throw new BadRequestException("Voucher expired or not yet valid");
        }

        if (totalAmount < Number(voucher.min_order_value)) {
          throw new BadRequestException(
            `Order minimum is ${voucher.min_order_value} to use this voucher`,
          );
        }

        if (voucher.discount_type === DiscountType.PERCENTAGE) {
          discountAmount = (totalAmount * Number(voucher.discount_value)) / 100;
          if (voucher.max_discount_amount) {
            discountAmount = Math.min(
              discountAmount,
              Number(voucher.max_discount_amount),
            );
          }
        } else {
          discountAmount = Number(voucher.discount_value);
        }
      }

      // Create order
      const order = manager.create(Order, {
        order_id: uuidv4().replace(/-/g, "").substring(0, 10),
        user_id: userId,
        restaurant_id: dto.restaurant_id,
        voucher_id: dto.voucher_id ?? null,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        status: OrderStatus.PENDING,
      });
      const savedOrder = await manager.save(Order, order);

      // Create order details
      for (const orderItem of dto.items) {
        const menuItem = itemMap.get(orderItem.item_id)!;
        const detail = manager.create(OrderDetail, {
          id: uuidv4().replace(/-/g, "").substring(0, 10),
          order_id: savedOrder.order_id,
          item_id: orderItem.item_id,
          quantity: orderItem.quantity,
          price_at_order: menuItem.price,
        });
        await manager.save(OrderDetail, detail);
      }

      //Nếu voucher được sử dụng, cập nhật thống kê
      if (savedOrder.voucher_id) {
        await this.updateVoucherStatistics(
          manager,
          savedOrder.voucher_id,
          savedOrder.discount_amount,
          savedOrder.created_at,
        );
      }

      return this.toDto(
        savedOrder,
        dto.items.map((oi) => ({
          item_id: oi.item_id,
          name: itemMap.get(oi.item_id)!.name,
          quantity: oi.quantity,
          price_at_order: Number(itemMap.get(oi.item_id)!.price),
        })),
      );
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderDetails', 'orderDetails')
      .leftJoinAndSelect('orderDetails.menuItem', 'menuItem')
      .skip(skip)
      .take(limit)
      .orderBy('order.created_at', 'DESC');

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders.map((o) => this.toDto(o, this.mapDetails(o))),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllByUser(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: { user_id: userId },
      relations: ["orderDetails", "orderDetails.menuItem"],
      order: { created_at: "DESC" },
    });
    return orders.map((o) => this.toDto(o, this.mapDetails(o)));
  }

  async findOne(orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { order_id: orderId },
      relations: ["orderDetails", "orderDetails.menuItem"],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return this.toDto(order, this.mapDetails(order));
  }

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { order_id: orderId },
      relations: ["orderDetails", "orderDetails.menuItem"],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    order.status = dto.status;

    if (dto.driver_id) {
      order.driver_id = dto.driver_id;
    }

    if (dto.status === OrderStatus.DELIVERED) {
      order.delivered_at = new Date();
    }

    const updated = await this.orderRepository.save(order);
    return this.toDto(updated, this.mapDetails(order));
  }

  private mapDetails(order: Order): OrderDetailItemDto[] {
    if (!order.orderDetails) return [];
    return order.orderDetails.map((d) => ({
      item_id: d.item_id,
      name: d.menuItem?.name ?? "",
      quantity: d.quantity,
      price_at_order: Number(d.price_at_order),
    }));
  }

  private async updateVoucherStatistics(
    manager: any,
    voucherId: string,
    discountAmount: number,
    usedDate: Date,
  ) {
    // Get the voucher repository through the manager
    const voucherRepository = manager.getRepository(Voucher);
    
    // Fetch voucher
    const voucher = await voucherRepository.findOne({
      where: { voucher_id: voucherId },
    });
    
    if (!voucher) return;

    // Update statistics
    voucher.total_used = (voucher.total_used || 0) + 1;
    voucher.total_discount = (Number(voucher.total_discount) || 0) + discountAmount;
    
    if (!voucher.first_used_date) {
      voucher.first_used_date = usedDate;
    }
    voucher.last_used_date = usedDate;

    // Save updated voucher
    await voucherRepository.save(voucher);
  }

  private toDto(order: Order, items: OrderDetailItemDto[]): OrderResponseDto {
    return {
      order_id: order.order_id,
      user_id: order.user_id,
      restaurant_id: order.restaurant_id,
      driver_id: order.driver_id,
      voucher_id: order.voucher_id,
      total_amount: Number(order.total_amount),
      discount_amount: Number(order.discount_amount),
      status: order.status,
      created_at: order.created_at,
      delivered_at: order.delivered_at,
      items,
    };
  }
}
