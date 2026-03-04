import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { Voucher } from '../../entities/voucher.entity';
import { NotFoundException } from '@nestjs/common';

const mockOrder = {
  order_id: 'O001',
  user_id: 'U001',
  restaurant_id: 'R001',
  driver_id: null,
  voucher_id: null,
  total_amount: 70000,
  discount_amount: 0,
  status: 'PENDING',
  created_at: new Date(),
  delivered_at: null,
  orderDetails: [],
};

const mockOrderRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn((fn: (manager: unknown) => unknown) => fn({
    findByIds: jest.fn().mockResolvedValue([
      { item_id: 'I001', name: 'Bún bò', price: 35000, is_available: true },
      { item_id: 'I002', name: 'Nước ngọt', price: 10000, is_available: true },
    ]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn((_, data) => data),
    save: jest.fn().mockImplementation((_, data) => Promise.resolve(data)),
  })),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderDetail), useValue: {} },
        { provide: getRepositoryToken(MenuItem), useValue: {} },
        { provide: getRepositoryToken(Voucher), useValue: {} },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return an order', async () => {
      mockOrderRepo.findOne.mockResolvedValue(mockOrder);
      const result = await service.findOne('O001');
      expect(result.order_id).toBe('O001');
    });

    it('should throw NotFoundException', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('X001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByUser', () => {
    it('should return orders for a user', async () => {
      mockOrderRepo.find.mockResolvedValue([mockOrder]);
      const result = await service.findAllByUser('U001');
      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe('U001');
    });
  });
});
