import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from "typeorm";
import { Order } from "./order.entity";

export enum DiscountType {
  FIXED = "FIXED",
  PERCENTAGE = "PERCENTAGE",
}

@Entity("vouchers")
export class Voucher {
  @PrimaryColumn({ length: 10 })
  voucher_id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  discount_type: DiscountType | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  discount_value: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  max_discount_amount: number | null;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  min_order_value: number;

  @Column({ type: "datetime", nullable: true })
  start_date: Date | null;

  @Column({ type: "datetime", nullable: true })
  end_date: Date | null;

  @Column({ type: "tinyint", default: 1 })
  is_active: boolean;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @Column({ type: "int", default: 0 })
  total_used: number;

  @Column({ type: "decimal", default: 0 })
  total_discount: number;

  @Column({ type: "datetime", nullable: true })
  first_used_date: Date;

  @Column({ type: "datetime", nullable: true })
  last_used_date: Date;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => Order, (order) => order.voucher)
  orders: Order[];
}
