import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  DeleteDateColumn,
} from "typeorm";
import { Order } from "./order.entity";

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
}

// mapping từ role sang prefix viết tắt cho user_id
export const RolePrefixMap: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: "CUS",
  [UserRole.ADMIN]: "ADM",
};

@Entity("users")
export class User {
  @PrimaryColumn({ length: 10 })
  user_id: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone_number: string | null;

  @Column({ type: "varchar", length: 255 })
  password_hash: string;

  @Column({ type: "text", nullable: true })
  default_address: string | null;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @DeleteDateColumn({ type: "datetime", nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
