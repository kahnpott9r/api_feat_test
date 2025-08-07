import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Tenant } from '../../tenants/entities/tenant.entity';
import { Base } from '../../base.entity';
import { Renter } from 'src/renters/entities/renters.entity';
import { Property } from 'src/properties/entities/property.entity';
import { LogisticalItem } from '../../logistical_items/entities/logistical_item.entity';
import { Finance } from '../../finance/entites/finance.entity';

export enum PaymentMethod {
  Automatic = 'automatic',
  Manual = 'manual',
}

export enum AgreementStatus {
  Active = 'active',
  Inactive = 'inactive',
}

@Entity()
export class Agreement extends Base {
  @Column({ default: PaymentMethod.Manual })
  payment_method: PaymentMethod;

  @Column({ default: 0 })
  paymentDate: number;

  @OneToMany(() => LogisticalItem, (items) => items.agreement, {
    cascade: true,
  })
  public logistical_items: LogisticalItem[];

  @ManyToOne(() => Renter, (renter) => renter.id)
  public primaryRenter: Renter;

  @ManyToMany(() => Renter, (renter) => renter.agreements, { eager: true })
  @JoinTable()
  public renters: Renter[];

  @ManyToOne(() => Property, (property) => property.id, { eager: true })
  public property: Property;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, { eager: true })
  public tenant!: Tenant;

  @Column({ default: null })
  startDate: Date;

  @Column({ default: null })
  endDate: Date;

  @Column({ default: null })
  endedDate: Date;

  @Column({ default: AgreementStatus.Active })
  status: AgreementStatus;

  @OneToMany(() => Finance, (finance) => finance.agreement)
  finances: Finance[];
}
