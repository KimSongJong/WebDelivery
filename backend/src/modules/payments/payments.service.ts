import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  // ─── Tạo thanh toán ───────────────────────────────────────────────
  async create(
    dto: CreatePaymentDto,
    userId: string,
  ): Promise<PaymentResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { order_id: dto.order_id },
    });
    if (!order) throw new NotFoundException(`Order ${dto.order_id} not found`);

    // Kiểm tra quyền sở hữu: chỉ chủ đơn hàng mới được tạo payment
    if (order.user_id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to create payment for this order',
      );
    }

    const existing = await this.paymentRepository.findOne({
      where: { order_id: dto.order_id },
    });
    if (existing) {
      throw new ConflictException('Payment already exists for this order');
    }

    const payment = this.paymentRepository.create({
      payment_id: uuidv4().replace(/-/g, '').substring(0, 10),
      order_id: dto.order_id,
      payment_method: dto.payment_method,
      payment_status: PaymentStatus.PENDING,
      amount: order.total_amount - order.discount_amount,
    });

    const saved = await this.paymentRepository.save(payment);
    return this.toDto(saved);
  }

  // ─── [Admin] Lấy danh sách tất cả payments (pagination) ──────────
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: PaymentResponseDto[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;

    const [payments, total] = await this.paymentRepository.findAndCount({
      order: { transaction_time: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: payments.map((p) => this.toDto(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Lấy 1 payment theo ID ────────────────────────────────────────
  async findOne(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_id: paymentId },
    });
    if (!payment)
      throw new NotFoundException(`Payment ${paymentId} not found`);
    return this.toDto(payment);
  }

  // ─── Lấy payment theo order_id ────────────────────────────────────
  async findByOrder(
    orderId: string,
    userId?: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { order_id: orderId },
      relations: ['order'],
    });
    if (!payment)
      throw new NotFoundException(`No payment for order ${orderId}`);

    // Kiểm tra quyền: nếu có userId (không phải Admin) → phải là chủ order
    if (userId && payment.order && payment.order.user_id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to view this payment',
      );
    }

    return this.toDto(payment);
  }

  // ─── Lịch sử thanh toán của user ─────────────────────────────────
  async findAllByUser(userId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.order', 'order')
      .where('order.user_id = :userId', { userId })
      .orderBy('payment.transaction_time', 'DESC')
      .getMany();

    return payments.map((p) => this.toDto(p));
  }

  // ─── [Admin] Xác nhận thanh toán → COMPLETED + Order → CONFIRMED ─
  async confirmPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_id: paymentId },
      relations: ['order'],
    });
    if (!payment)
      throw new NotFoundException(`Payment ${paymentId} not found`);

    if (payment.payment_status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment already processed');
    }

    payment.payment_status = PaymentStatus.COMPLETED;
    payment.transaction_time = new Date();
    const updated = await this.paymentRepository.save(payment);

    // Cập nhật order status → CONFIRMED
    if (payment.order && payment.order.status === OrderStatus.PENDING) {
      payment.order.status = OrderStatus.CONFIRMED;
      await this.orderRepository.save(payment.order);
    }

    return this.toDto(updated);
  }

  // ─── Hủy thanh toán (User) → FAILED ──────────────────────────────
  async cancelPayment(
    paymentId: string,
    userId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_id: paymentId },
      relations: ['order'],
    });
    if (!payment)
      throw new NotFoundException(`Payment ${paymentId} not found`);

    // Kiểm tra quyền sở hữu
    if (payment.order && payment.order.user_id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to cancel this payment',
      );
    }

    if (payment.payment_status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING payments can be cancelled',
      );
    }

    payment.payment_status = PaymentStatus.FAILED;
    payment.transaction_time = new Date();
    const updated = await this.paymentRepository.save(payment);
    return this.toDto(updated);
  }

  // ─── [Admin] Hoàn tiền → REFUNDED ────────────────────────────────
  async refundPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_id: paymentId },
    });
    if (!payment)
      throw new NotFoundException(`Payment ${paymentId} not found`);

    if (payment.payment_status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Only COMPLETED payments can be refunded',
      );
    }

    payment.payment_status = PaymentStatus.REFUNDED;
    payment.transaction_time = new Date();
    const updated = await this.paymentRepository.save(payment);
    return this.toDto(updated);
  }

  // ─── Helper: toDto ────────────────────────────────────────────────
  private toDto(p: Payment): PaymentResponseDto {
    return {
      payment_id: p.payment_id,
      order_id: p.order_id,
      payment_method: p.payment_method,
      payment_status: p.payment_status,
      amount: Number(p.amount),
      transaction_time: p.transaction_time,
    };
  }
}
