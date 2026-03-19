import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Driver } from '../../entities/driver.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverResponseDto } from './dto/driver-response.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  async findAll(): Promise<DriverResponseDto[]> {
    const drivers = await this.driverRepository.find({
      where: { is_active: true },
    });
    return drivers.map((d) => this.toDto(d));
  }

  async findOne(id: string): Promise<DriverResponseDto> {
    const driver = await this.driverRepository.findOne({
      where: { driver_id: id, is_active: true },
    });
    if (!driver) throw new NotFoundException(`Driver ${id} not found`);
    return this.toDto(driver);
  }

  async create(dto: CreateDriverDto): Promise<DriverResponseDto> {
    const driver = this.driverRepository.create({
      driver_id: uuidv4().replace(/-/g, '').substring(0, 10),
      ...dto,
    });
    const saved = await this.driverRepository.save(driver);
    return this.toDto(saved);
  }

  async update(id: string, dto: UpdateDriverDto): Promise<DriverResponseDto> {
    const driver = await this.driverRepository.findOne({
      where: { driver_id: id },
    });
    if (!driver) throw new NotFoundException(`Driver ${id} not found`);
    Object.assign(driver, dto);
    const updated = await this.driverRepository.save(driver);
    return this.toDto(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const driver = await this.driverRepository.findOne({
      where: { driver_id: id, is_active: true },
    });
    if (!driver) throw new NotFoundException(`Driver ${id} not found`);
    driver.is_active = false;
    await this.driverRepository.save(driver);
    return { message: `Driver ${id} deactivated successfully` };
  }

  private toDto(driver: Driver): DriverResponseDto {
    return {
      driver_id: driver.driver_id,
      name: driver.name,
      phone_number: driver.phone_number,
      vehicle_info: driver.vehicle_info,
      current_lat: driver.current_lat,
      current_long: driver.current_long,
      is_active: driver.is_active,
      created_at: driver.created_at,
    };
  }
}
