import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

export enum ROLE {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

@Entity()
export class UserRole extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  @Expose()
  @Column({ default: ROLE.USER })
  public role: ROLE;

  @ManyToOne(() => User, (user) => user.user_roles)
  public user!: User;

  @ManyToOne(() => Tenant, (tenant) => tenant.user_roles, { eager: true })
  public tenant!: Tenant;
}
