import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockUser: Partial<User> = {
  user_id: 'U001',
  name: 'Nguyen Van A',
  email: 'test@example.com',
  phone_number: '0901234567',
  default_address: 'HCM',
  created_at: new Date(),
};

const mockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.resetAllMocks();
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      mockUserRepository.findAndCount.mockResolvedValue([[mockUser], 1]);
      const result = await service.findAll({});
      expect(result.data).toHaveLength(1);
      expect(result.data[0].user_id).toBe('U001');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne('U001');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('X999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)  // first call: find user
        .mockResolvedValueOnce(null);     // second call: email not taken
      mockUserRepository.save.mockResolvedValue({ ...mockUser, name: 'Updated' });

      const result = await service.update('U001', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw ConflictException if new email already taken', async () => {
      const takenUser = { user_id: 'U002', email: 'taken@example.com' };
      mockUserRepository.findOne
        .mockResolvedValueOnce(mockUser)    // first call: find user by id
        .mockResolvedValueOnce(takenUser);  // second call: email already exists

      await expect(
        service.update('U001', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.remove.mockResolvedValueOnce(mockUser);
      const result = await service.remove('U001');
      expect(result.message).toContain('U001');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.remove('X999')).rejects.toThrow(NotFoundException);
    });
  });
});
