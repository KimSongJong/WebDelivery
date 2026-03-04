import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { Order } from '../../entities/order.entity';
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

  async create(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { order_id: dto.order_id },
    });
    if (!order) throw new NotFoundException(`Order ${dto.order_id} not found`);

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

  async findByOrder(orderId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { order_id: orderId },
    });
    if (!payment) throw new NotFoundException(`No payment for order ${orderId}`);
    return this.toDto(payment);
  }

  async confirmPayment(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { payment_id: paymentId },
    });
    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

    if (payment.payment_status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment already processed');
    }

    payment.payment_status = PaymentStatus.COMPLETED;
    payment.transaction_time = new Date();
    const updated = await this.paymentRepository.save(payment);
    return this.toDto(updated);
  }

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
