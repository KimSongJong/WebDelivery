import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Code, Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { Voucher } from "../../entities/voucher.entity";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { VoucherResponseDto } from "./dto/voucher-response.dto";
import { Like } from "typeorm";
import { UpdateVoucherDto } from "./dto/update_voucher.dto";

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
  ) {}

  async findAll(search?: string): Promise<VoucherResponseDto[]> {
    const where = search
      ? [{ code: Like(`%${search}%`), is_active: true }, { description: Like(`%${search}%`), is_active: true }]
      : { is_active: true };
    const vouchers = await this.voucherRepository.find({ where });
    return vouchers.map((v) => this.toDto(v));
  }

  async findByCode(code: string): Promise<VoucherResponseDto> {
    const voucher = await this.voucherRepository.findOne({ where: { code, is_active: true } });
    if (!voucher) throw new NotFoundException(`Voucher "${code}" not found`);
    return this.toDto(voucher);
  }

  async create(dto: CreateVoucherDto): Promise<VoucherResponseDto> {
    const existing = await this.voucherRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) throw new ConflictException("Voucher code already exists");

    const voucher = this.voucherRepository.create({
      voucher_id: uuidv4().replace(/-/g, "").substring(0, 10),
      code: dto.code,
      description: dto.description ?? null,
      discount_type: dto.discount_type,
      discount_value: dto.discount_value,
      max_discount_amount: dto.max_discount_amount ?? null,
      min_order_value: dto.min_order_value ?? 0,
      start_date: dto.start_date ? new Date(dto.start_date) : null,
      end_date: dto.end_date ? new Date(dto.end_date) : null,
      is_active: dto.is_active ?? true,
    });

    const saved = await this.voucherRepository.save(voucher);
    return this.toDto(saved);
  }

  async deactivate(id: string): Promise<VoucherResponseDto> {
    const voucher = await this.voucherRepository.findOne({
      where: { voucher_id: id },
    });
    if (!voucher) throw new NotFoundException(`Voucher ${id} not found`);
    voucher.is_active = false;
    const updated = await this.voucherRepository.save(voucher);
    return this.toDto(updated);
  }

  async activate(id: string): Promise<VoucherResponseDto> {
    const voucher = await this.voucherRepository.findOne({
      where: { voucher_id: id },
    });
    if (!voucher) throw new NotFoundException(`Voucher ${id} not found`);
    voucher.is_active = true;
    const updated = await this.voucherRepository.save(voucher);
    return this.toDto(updated);
  }

  async update(id: string, dto: UpdateVoucherDto): Promise<VoucherResponseDto> {
    const voucher = await this.voucherRepository.findOne({
      where: { voucher_id: id },
    });
    if (!voucher) throw new NotFoundException(`Voucher ${id} not found`);

    Object.assign(voucher, dto);
    const updated = await this.voucherRepository.save(voucher);
    return this.toDto(updated);
  }

  async getStatistics(id: string) {
    const voucher = await this.voucherRepository.findOne({
      where: { voucher_id: id },
    });
    if (!voucher) throw new NotFoundException(`Voucher ${id} not found`);

    return {
      total_used: voucher.total_used,
      total_discount: voucher.total_discount,
      first_used_date: voucher.first_used_date,
      last_used_date: voucher.last_used_date,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const voucher = await this.voucherRepository.findOne({
      where: { voucher_id: id, is_active: true },
    });
    if (!voucher) throw new NotFoundException(`Voucher ${id} not found`);

    voucher.is_active = false;
    await this.voucherRepository.save(voucher);
    return { message: `Voucher ${voucher.code} deactivated successfully` };
  }

  private toDto(v: Voucher): VoucherResponseDto {
    return {
      voucher_id: v.voucher_id,
      code: v.code,
      description: v.description,
      discount_type: v.discount_type,
      discount_value: Number(v.discount_value),
      max_discount_amount:
        v.max_discount_amount !== null ? Number(v.max_discount_amount) : null,
      min_order_value: Number(v.min_order_value),
      start_date: v.start_date,
      end_date: v.end_date,
      is_active: v.is_active,
      created_at: v.created_at,
    };
  }
}
