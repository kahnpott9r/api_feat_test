import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Base } from '../../base.entity';
import { Property } from '../../properties/entities/property.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { TaskAttachment } from './task-attachments.entity';
import { Supplier } from 'src/suppliers/entities/suppliers.entity';

export enum TaskPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export enum TaskStatus {
  OPEN = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
}

export enum TaskCategory {
  TECHNICAL = 0,
  MAINTENANCE = 1,
  CLEANING = 2,
  OTHER = 3,
}

export enum TaskSubCategory {
  LEAK = 0,
  ELECTRICAL = 1,
  HVAC = 2,
  PLUMBING = 3,

  PAINTING = 10,
  CARPENTRY = 11,
  GARDENING = 12,
  PEST_CONTROL = 13,
  WASTE_MANAGEMENT = 14,

  REGULAR_CLEANING = 20,
  DEEP_CLEANING = 21,
  WINDOW_CLEANING = 22,
  CARPET_CLEANING = 23,

  INSPECTION = 30,
  DOCUMENTATION = 31,
  EMERGENCY= 32,
  GENERAL = 33,
}

@Entity()
export class Task extends Base {
  @Column({ default: null })
  description: string;

  @Column({ default: TaskPriority.LOW })
  priority: TaskPriority;

  @Column({ default: TaskStatus.OPEN })
  status: TaskStatus;

  @Column({
    nullable: true,
  })
  started_at: Date;

  @Column({
    nullable: true,
  })
  deadline_at: Date;

  @Column({
    default: null,
    nullable: false,
  })
  category: TaskCategory;

  @Column({
    default: null,
    nullable: true,
  })
  subCategory: TaskSubCategory;

  @Column({
    nullable: true,
  })
  scheduled_at: Date

  @ManyToOne(() => Supplier, (supplier) => supplier.tasks, {
    eager: true,
  })
  supplier!: Supplier;

  @Column({
    nullable: true,
  })
  completed_at: Date;

  @ManyToOne(() => Property, (property) => property.tasks)
  property!: Property;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { eager: true })
  public tenant!: Tenant;

  @OneToMany(() => TaskAttachment, (attachment) => attachment.task, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  attachments: TaskAttachment[];
}
