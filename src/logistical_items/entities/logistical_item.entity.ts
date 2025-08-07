import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Tenant } from '../../tenants/entities/tenant.entity';
import { Base } from '../../base.entity';
import { Renter } from 'src/renters/entities/renters.entity';
import { TaxCode } from 'src/tax_codes/entities/tax_code.entity';
import { Agreement } from 'src/agreements/entities/agreement.entity';
import { ColumnNumericTransformer } from '../../Utils/ColumnNumericTransformer';

export enum LOGISTICAL_TYPE {
  RENT = 'rent',
  SERVICE_FEE = 'servicefee',
  DEPOSIT = 'deposit',
  OHTER = 'other',
}

@Entity()
export class LogisticalItem extends Base {
  @Column({ default: null })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ default: LOGISTICAL_TYPE.RENT })
  type: LOGISTICAL_TYPE;

  @OneToMany(() => Renter, (renter) => renter.id)
  public renters: Renter[];

  @ManyToOne(() => Agreement, (agree) => agree.logistical_items)
  public agreement!: Agreement;

  @ManyToOne(() => Tenant, (tenant) => tenant.id)
  public tenant!: Tenant;

  @ManyToOne(() => TaxCode, (code) => code.id)
  public tax_code: TaxCode;
}
