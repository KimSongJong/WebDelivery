import { Test, TestingModule } from '@nestjs/testing';
import { VouchersService } from './vouchers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Voucher, DiscountType } from '../../entities/voucher.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockVoucher: Partial<Voucher> = {
  voucher_id: 'V001',
  code: 'SAVE20',
  description: 'Save 20k',
  discount_type: DiscountType.FIXED,
  discount_value: 20000,
  max_discount_amount: null,
  min_order_value: 50000,
  start_date: null,
  end_date: null,
  is_active: true,
  created_at: new Date(),
};

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('VouchersService', () => {
  let service: VouchersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        { provide: getRepositoryToken(Voucher), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<VouchersService>(VouchersService);
    jest.clearAllMocks();
  });

  it('should return all vouchers', async () => {
    mockRepo.find.mockResolvedValue([mockVoucher]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('SAVE20');
  });

  it('should throw NotFoundException for unknown code', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findByCode('UNKNOWN')).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException for duplicate code', async () => {
    mockRepo.findOne.mockResolvedValue(mockVoucher);
    await expect(
      service.create({ code: 'SAVE20', discount_type: DiscountType.FIXED, discount_value: 10000 }),
    ).rejects.toThrow(ConflictException);
  });

  it('should create a voucher', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.create.mockReturnValue(mockVoucher);
    mockRepo.save.mockResolvedValue(mockVoucher);
    const result = await service.create({
      code: 'NEW10',
      discount_type: DiscountType.FIXED,
      discount_value: 10000,
    });
    expect(result.code).toBe('SAVE20');
  });
});
