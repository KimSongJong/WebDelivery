import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsService } from './restaurants.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restaurant } from '../../entities/restaurant.entity';
import { NotFoundException } from '@nestjs/common';

const mockRestaurant: Partial<Restaurant> = {
  restaurant_id: 'R001',
  name: 'Bún Bò',
  description: null,
  address: 'HCM',
  res_lat: 10.8,
  res_long: 106.7,
  is_open: true,
};

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('RestaurantsService', () => {
  let service: RestaurantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: getRepositoryToken(Restaurant), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<RestaurantsService>(RestaurantsService);
    jest.clearAllMocks();
  });

  it('should return all restaurants', async () => {
    mockRepo.find.mockResolvedValue([mockRestaurant]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].restaurant_id).toBe('R001');
  });

  it('should throw NotFoundException for unknown id', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('X001')).rejects.toThrow(NotFoundException);
  });

  it('should create a restaurant', async () => {
    mockRepo.create.mockReturnValue(mockRestaurant);
    mockRepo.save.mockResolvedValue(mockRestaurant);
    const result = await service.create({ name: 'Bún Bò' });
    expect(result.name).toBe('Bún Bò');
  });
});
