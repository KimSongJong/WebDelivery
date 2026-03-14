import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../entities/user.entity';

// Re-export UserRole as Role for backward compatibility
export const Role = UserRole;
export type Role = UserRole;

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
