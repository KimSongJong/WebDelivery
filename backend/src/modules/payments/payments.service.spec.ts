import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment, PaymentStatus, PaymentMethod } from '../../entities/payment.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

// ─── Mock Data ──────────────────────────────────────────────────────

const mockOrder = {
  order_id: 'ORD001',
  user_id: 'USR001',
  restaurant_id: 'RES001',
  total_amount: 100000,
  discount_amount: 10000,
  status: OrderStatus.PENDING,
  created_at: new Date(),
};

const mockPayment = {
  payment_id: 'PAY001',
  order_id: 'ORD001',
  payment_method: PaymentMethod.CASH,
  payment_status: PaymentStatus.PENDING,
  amount: 90000,
  transaction_time: null,
  order: mockOrder,
};

// ─── Mock Repositories ──────────────────────────────────────────────

const mockPaymentRepo = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockOrderRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
};

// ─── Tests ──────────────────────────────────────────────────────────

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════
  // create()
  // ═══════════════════════════════════════════════════════════════════

  describe('create', () => {
    const dto = { order_id: 'ORD001', payment_method: PaymentMethod.CASH };

    it('should create a payment successfully', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      mockPaymentRepo.findOne.mockResolvedValue(null); // no existing payment
      mockPaymentRepo.create.mockImplementation((data) => data);
      mockPaymentRepo.save.mockImplementation((data) => Promise.resolve(data));

      const result = await service.create(dto, 'USR001');

      expect(result.order_id).toBe('ORD001');
      expect(result.payment_method).toBe(PaymentMethod.CASH);
      expect(result.payment_status).toBe(PaymentStatus.PENDING);
      expect(result.amount).toBe(90000); // 100000 - 10000
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto, 'USR001')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the order', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);

      await expect(service.create(dto, 'OTHER_USER')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException if payment already exists', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      mockPaymentRepo.findOne.mockResolvedValue(mockPayment);

      await expect(service.create(dto, 'USR001')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // findAll()
  // ═══════════════════════════════════════════════════════════════════

  describe('findAll', () => {
    it('should return paginated payments', async () => {
      mockPaymentRepo.findAndCount.mockResolvedValue([[mockPayment], 1]);

      const result = await service.findAll(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should return empty list when no payments', async () => {
      mockPaymentRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(1, 20);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // findOne()
  // ═══════════════════════════════════════════════════════════════════

  describe('findOne', () => {
    it('should return a payment by ID', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(mockPayment);

      const result = await service.findOne('PAY001');

      expect(result.payment_id).toBe('PAY001');
      expect(result.amount).toBe(90000);
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // findByOrder()
  // ═══════════════════════════════════════════════════════════════════

  describe('findByOrder', () => {
    it('should return payment by order ID', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(mockPayment);

      const result = await service.findByOrder('ORD001');

      expect(result.order_id).toBe('ORD001');
    });

    it('should throw NotFoundException if no payment for order', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(null);

      await expect(service.findByOrder('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the order', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(mockPayment);

      await expect(service.findByOrder('ORD001', 'OTHER_USER')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow viewing when userId matches order owner', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(mockPayment);

      const result = await service.findByOrder('ORD001', 'USR001');

      expect(result.order_id).toBe('ORD001');
    });

    it('should allow Admin (no userId) to view any payment', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(mockPayment);

      const result = await service.findByOrder('ORD001'); // no userId = Admin

      expect(result.order_id).toBe('ORD001');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // findAllByUser()
  // ═══════════════════════════════════════════════════════════════════

  describe('findAllByUser', () => {
    it('should return payments for a user', async () => {
      const qb = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockPayment]),
      };
      mockPaymentRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllByUser('USR001');

      expect(result).toHaveLength(1);
      expect(result[0].payment_id).toBe('PAY001');
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // confirmPayment()
  // ═══════════════════════════════════════════════════════════════════

  describe('confirmPayment', () => {
    it('should confirm a PENDING payment and update order to CONFIRMED', async () => {
      const pendingPayment = {
        ...mockPayment,
        payment_status: PaymentStatus.PENDING,
        order: { ...mockOrder, status: OrderStatus.PENDING },
      };
      mockPaymentRepo.findOne.mockResolvedValue(pendingPayment);
      mockPaymentRepo.save.mockImplementation((p) => Promise.resolve(p));
      mockOrderRepo.save.mockImplementation((o) => Promise.resolve(o));

      const result = await service.confirmPayment('PAY001');

      expect(result.payment_status).toBe(PaymentStatus.COMPLETED);
      expect(mockOrderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.CONFIRMED }),
      );
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(null);

      await expect(service.confirmPayment('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if payment is not PENDING', async () => {
      mockPaymentRepo.findOne.mockResolvedValue({
        ...mockPayment,
        payment_status: PaymentStatus.COMPLETED,
      });

      await expect(service.confirmPayment('PAY001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // cancelPayment()
  // ═══════════════════════════════════════════════════════════════════

  describe('cancelPayment', () => {
    it('should cancel a PENDING payment', async () => {
      const pendingPayment = {
        ...mockPayment,
        payment_status: PaymentStatus.PENDING,
      };
      mockPaymentRepo.findOne.mockResolvedValue(pendingPayment);
      mockPaymentRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.cancelPayment('PAY001', 'USR001');

      expect(result.payment_status).toBe(PaymentStatus.FAILED);
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(null);

      await expect(service.cancelPayment('INVALID', 'USR001')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the order', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(mockPayment);

      await expect(
        service.cancelPayment('PAY001', 'OTHER_USER'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if payment is not PENDING', async () => {
      mockPaymentRepo.findOne.mockResolvedValue({
        ...mockPayment,
        payment_status: PaymentStatus.COMPLETED,
        order: { ...mockOrder, user_id: 'USR001' },
      });

      await expect(
        service.cancelPayment('PAY001', 'USR001'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // refundPayment()
  // ═══════════════════════════════════════════════════════════════════

  describe('refundPayment', () => {
    it('should refund a COMPLETED payment', async () => {
      const completedPayment = {
        ...mockPayment,
        payment_status: PaymentStatus.COMPLETED,
      };
      mockPaymentRepo.findOne.mockResolvedValue(completedPayment);
      mockPaymentRepo.save.mockImplementation((p) => Promise.resolve(p));

      const result = await service.refundPayment('PAY001');

      expect(result.payment_status).toBe(PaymentStatus.REFUNDED);
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPaymentRepo.findOne.mockResolvedValue(null);

      await expect(service.refundPayment('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if payment is not COMPLETED', async () => {
      mockPaymentRepo.findOne.mockResolvedValue({
        ...mockPayment,
        payment_status: PaymentStatus.PENDING,
      });

      await expect(service.refundPayment('PAY001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
